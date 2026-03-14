"""
Blog Post Management API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user, AuthenticatedUser
from app.core.database import get_supabase
from app.core.exceptions import NotFoundError, ValidationError
from app.core.dependencies import get_blog_generator_service
from app.core.logging import get_logger
from app.api.schemas.blogs import BlogGenerateRequest, BlogUpdateRequest, BlogPublishRequest, BlogResponse
from app.services.blog_generator import BlogGeneratorService
from app.services.domain_helpers import build_brand_profile
from app.services.wordpress_publisher import publish_to_wordpress

router = APIRouter()
logger = get_logger("api.blogs")


@router.post("/generate", response_model=BlogResponse)
async def generate(
    data: BlogGenerateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    blog_svc: BlogGeneratorService = Depends(get_blog_generator_service),
):
    sb = get_supabase()

    domain_result = sb.table("domains").select("*").eq("id", data.domain_id).eq("user_id", user.id).execute()
    if not domain_result.data:
        raise NotFoundError("Domain", data.domain_id)

    domain = domain_result.data[0]
    if domain["crawl_status"] != "completed":
        raise ValidationError("Domain crawl not completed yet")

    keyword_text = data.custom_keyword
    title_text = data.custom_title
    search_vol = None
    difficulty = None

    if data.keyword_id:
        kw_result = sb.table("keywords").select("*").eq("id", data.keyword_id).eq("user_id", user.id).execute()
        if kw_result.data:
            kw = kw_result.data[0]
            keyword_text = kw["keyword"]
            title_text = title_text or kw.get("suggested_title")
            search_vol = kw.get("search_volume")
            difficulty = kw.get("difficulty")
            sb.table("keywords").update({"used": True}).eq("id", data.keyword_id).execute()

    if not keyword_text:
        raise ValidationError("Provide keyword_id or custom_keyword")

    brand_profile = build_brand_profile(domain)

    result = await blog_svc.generate_blog_post(
        keyword=keyword_text,
        suggested_title=title_text or keyword_text,
        brand_profile=brand_profile,
        word_count=data.word_count,
    )

    blog_record = sb.table("blog_posts").insert({
        "domain_id": data.domain_id,
        "user_id": user.id,
        "title": result["title"],
        "slug": result["slug"],
        "meta_description": result["meta_description"],
        "body_html": result["body_html"],
        "target_keyword": keyword_text,
        "search_volume": search_vol,
        "difficulty": difficulty,
        "word_count": result["word_count"],
        "status": "draft",
    }).execute()

    return blog_record.data[0]


@router.get("", response_model=list[BlogResponse])
async def list_blogs(
    domain_id: str | None = None,
    status: str | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    query = sb.table("blog_posts").select("*").eq("user_id", user.id)
    if domain_id:
        query = query.eq("domain_id", domain_id)
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("blog_posts").select("*").eq("id", blog_id).eq("user_id", user.id).execute()
    if not result.data:
        raise NotFoundError("BlogPost", blog_id)
    return result.data[0]


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    data: BlogUpdateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    existing = sb.table("blog_posts").select("id").eq("id", blog_id).eq("user_id", user.id).execute()
    if not existing.data:
        raise NotFoundError("BlogPost", blog_id)

    update_data: dict = {}
    if data.title is not None:
        update_data["title"] = data.title
    if data.meta_description is not None:
        update_data["meta_description"] = data.meta_description
    if data.body_html is not None:
        update_data["body_html"] = data.body_html
    update_data["status"] = "ready"

    sb.table("blog_posts").update(update_data).eq("id", blog_id).execute()
    result = sb.table("blog_posts").select("*").eq("id", blog_id).execute()
    return result.data[0]


@router.post("/{blog_id}/publish", response_model=BlogResponse)
async def publish_blog(
    blog_id: str,
    data: BlogPublishRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    post_result = sb.table("blog_posts").select("*").eq("id", blog_id).eq("user_id", user.id).execute()
    if not post_result.data:
        raise NotFoundError("BlogPost", blog_id)

    post = post_result.data[0]

    try:
        wp_result = await publish_to_wordpress(
            title=post["title"], body_html=post.get("body_html", ""),
            slug=post["slug"], meta_description=post.get("meta_description", ""),
            status=data.publish_status, wp_url=data.wp_url,
            wp_username=data.wp_username, wp_password=data.wp_password,
        )
        sb.table("blog_posts").update({
            "wp_post_id": wp_result["wp_post_id"],
            "wp_url": wp_result["wp_url"],
            "status": "published",
        }).eq("id", blog_id).execute()
    except Exception as e:
        sb.table("blog_posts").update({"status": "failed"}).eq("id", blog_id).execute()
        raise HTTPException(status_code=500, detail=f"WordPress publish failed: {str(e)}")

    result = sb.table("blog_posts").select("*").eq("id", blog_id).execute()
    return result.data[0]
