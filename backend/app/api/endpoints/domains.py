"""
Domain Management API Endpoints
"""
import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.domain import Domain, CrawlStatus
from app.services.crawler import crawl_domain
from app.services.llm_service import analyze_brand

router = APIRouter()


# --- Schemas ---

class DomainCreate(BaseModel):
    url: str

class DomainResponse(BaseModel):
    id: int
    url: str
    company_name: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    brand_voice: str | None = None
    brand_summary: str | None = None
    key_topics: list[str] | None = None
    crawl_status: str
    pages_crawled: int

    class Config:
        from_attributes = True


# --- Background Task ---

async def _run_crawl_and_analyze(domain_id: int):
    """Background task: crawl domain and run LLM brand analysis."""
    from app.core.database import async_session
    
    async with async_session() as db:
        domain = await db.get(Domain, domain_id)
        if not domain:
            return
        
        try:
            domain.crawl_status = CrawlStatus.CRAWLING
            await db.commit()
            
            # Step 1: Crawl (async)
            crawl_data = await crawl_domain(domain.url)
            domain.pages_crawled = crawl_data["pages_crawled"]
            
            # Step 2: LLM Brand Analysis (sync — Gemini SDK is synchronous)
            brand_profile = analyze_brand(crawl_data)
            
            domain.company_name = brand_profile.get("company_name")
            domain.industry = brand_profile.get("industry")
            domain.target_audience = brand_profile.get("target_audience")
            domain.brand_voice = brand_profile.get("brand_voice")
            domain.brand_summary = brand_profile.get("brand_summary")
            domain.key_topics = json.dumps(brand_profile.get("key_topics", []))
            domain.crawl_status = CrawlStatus.COMPLETED
            
            await db.commit()
            
        except Exception as e:
            domain.crawl_status = CrawlStatus.FAILED
            domain.crawl_error = str(e)[:1000]
            await db.commit()


# --- Endpoints ---

@router.post("", response_model=DomainResponse)
async def create_domain(
    data: DomainCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Submit a domain for crawling and brand analysis."""
    # Check if already exists
    existing = await db.execute(select(Domain).where(Domain.url == data.url))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Domain already registered")
    
    domain = Domain(url=data.url, crawl_status=CrawlStatus.PENDING)
    db.add(domain)
    await db.commit()
    await db.refresh(domain)
    
    # Kick off crawl in background
    background_tasks.add_task(_run_crawl_and_analyze, domain.id)
    
    return _to_response(domain)


@router.get("", response_model=list[DomainResponse])
async def list_domains(db: AsyncSession = Depends(get_db)):
    """List all registered domains."""
    result = await db.execute(select(Domain).order_by(Domain.created_at.desc()))
    domains = result.scalars().all()
    return [_to_response(d) for d in domains]


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(domain_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single domain with its brand profile."""
    domain = await db.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return _to_response(domain)


def _to_response(domain: Domain) -> DomainResponse:
    topics = []
    if domain.key_topics:
        try:
            topics = json.loads(domain.key_topics)
        except (json.JSONDecodeError, TypeError):
            topics = []
    
    return DomainResponse(
        id=domain.id,
        url=domain.url,
        company_name=domain.company_name,
        industry=domain.industry,
        target_audience=domain.target_audience,
        brand_voice=domain.brand_voice,
        brand_summary=domain.brand_summary,
        key_topics=topics,
        crawl_status=domain.crawl_status.value if isinstance(domain.crawl_status, CrawlStatus) else domain.crawl_status,
        pages_crawled=domain.pages_crawled or 0,
    )
