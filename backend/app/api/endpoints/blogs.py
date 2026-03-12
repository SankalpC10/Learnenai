"""
Blog Post Management API Endpoints
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.domain import Domain, Keyword, BlogPost, PostStatus, CrawlStatus
from app.services.blog_generator import generate_blog_post
from app.services.wordpress_publisher import publish_to_wordpress

router = APIRouter()


# --- Schemas ---

class BlogGenerateRequest(BaseModel):
    domain_id: int
    keyword_id: int | None = None
    custom_keyword: str | None = None
    custom_title: str | None = None
    word_count: int = 1500

class BlogUpdateRequest(BaseModel):
    title: str | None = None
    meta_description: str | None = None
    body_html: str | None = None

class BlogPublishRequest(BaseModel):
    wp_url: str | None = None
    wp_username: str | None = None
    wp_password: str | None = None
    publish_status: str = "draft"  # "draft" or "publish"

class BlogResponse(BaseModel):
    id: int
    domain_id: int
    title: str
    slug: str
    meta_description: str | None = None
    body_html: str | None = None
    target_keyword: str | None = None
    search_volume: int | None = None
    difficulty: str | None = None
    word_count: int | None = None
    status: str
    wp_post_id: int | None = None
    wp_url: str | None = None

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.post("/generate", response_model=BlogResponse)
async def generate(
    data: BlogGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate a new blog post using AI."""
    domain = await db.get(Domain, data.domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    if domain.crawl_status != CrawlStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Domain crawl not completed yet")
    
    # Determine keyword and title
    keyword_text = data.custom_keyword
    title_text = data.custom_title
    search_vol = None
    difficulty = None
    
    if data.keyword_id:
        kw_record = await db.get(Keyword, data.keyword_id)
        if kw_record:
            keyword_text = kw_record.keyword
            title_text = title_text or kw_record.suggested_title
            search_vol = kw_record.search_volume
            difficulty = kw_record.difficulty
            kw_record.used = True
    
    if not keyword_text:
        raise HTTPException(status_code=400, detail="Provide keyword_id or custom_keyword")
    
    # Build brand profile
    topics = []
    if domain.key_topics:
        try:
            topics = json.loads(domain.key_topics)
        except (json.JSONDecodeError, TypeError):
            pass
    
    brand_profile = {
        "company_name": domain.company_name,
        "industry": domain.industry,
        "target_audience": domain.target_audience,
        "brand_voice": domain.brand_voice,
        "key_topics": topics,
        "brand_summary": domain.brand_summary,
    }
    
    # Generate the post
    result = await generate_blog_post(
        keyword=keyword_text,
        suggested_title=title_text or keyword_text,
        brand_profile=brand_profile,
        word_count=data.word_count,
    )
    
    # Save to database
    blog_post = BlogPost(
        domain_id=data.domain_id,
        title=result["title"],
        slug=result["slug"],
        meta_description=result["meta_description"],
        body_html=result["body_html"],
        target_keyword=keyword_text,
        search_volume=search_vol,
        difficulty=difficulty,
        word_count=result["word_count"],
        status=PostStatus.DRAFT,
    )
    db.add(blog_post)
    await db.commit()
    await db.refresh(blog_post)
    
    return _to_response(blog_post)


@router.get("", response_model=list[BlogResponse])
async def list_blogs(
    domain_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all blog posts, optionally filtered by domain."""
    query = select(BlogPost).order_by(BlogPost.created_at.desc())
    if domain_id:
        query = query.where(BlogPost.domain_id == domain_id)
    
    result = await db.execute(query)
    return [_to_response(b) for b in result.scalars().all()]


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single blog post."""
    post = await db.get(BlogPost, blog_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _to_response(post)


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: int,
    data: BlogUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Edit a blog post draft."""
    post = await db.get(BlogPost, blog_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    if data.title is not None:
        post.title = data.title
    if data.meta_description is not None:
        post.meta_description = data.meta_description
    if data.body_html is not None:
        post.body_html = data.body_html
    
    post.status = PostStatus.READY
    await db.commit()
    await db.refresh(post)
    
    return _to_response(post)


@router.post("/{blog_id}/publish", response_model=BlogResponse)
async def publish_blog(
    blog_id: int,
    data: BlogPublishRequest,
    db: AsyncSession = Depends(get_db),
):
    """Publish a blog post to WordPress."""
    post = await db.get(BlogPost, blog_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    try:
        result = await publish_to_wordpress(
            title=post.title,
            body_html=post.body_html or "",
            slug=post.slug,
            meta_description=post.meta_description or "",
            status=data.publish_status,
            wp_url=data.wp_url,
            wp_username=data.wp_username,
            wp_password=data.wp_password,
        )
        
        post.wp_post_id = result["wp_post_id"]
        post.wp_url = result["wp_url"]
        post.status = PostStatus.PUBLISHED
        await db.commit()
        await db.refresh(post)
        
    except Exception as e:
        post.status = PostStatus.FAILED
        await db.commit()
        raise HTTPException(status_code=500, detail=f"WordPress publish failed: {str(e)}")
    
    return _to_response(post)


def _to_response(post: BlogPost) -> BlogResponse:
    return BlogResponse(
        id=post.id,
        domain_id=post.domain_id,
        title=post.title,
        slug=post.slug,
        meta_description=post.meta_description,
        body_html=post.body_html,
        target_keyword=post.target_keyword,
        search_volume=post.search_volume,
        difficulty=post.difficulty,
        word_count=post.word_count,
        status=post.status.value if isinstance(post.status, PostStatus) else post.status,
        wp_post_id=post.wp_post_id,
        wp_url=post.wp_url,
    )
