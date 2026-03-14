"""
Domain Management API Endpoints
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from app.core.auth import get_current_user, AuthenticatedUser
from app.core.database import get_supabase
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.api.schemas.domains import DomainCreate, DomainResponse
from app.services.crawler import crawl_domain
from app.services.llm.factory import get_llm_provider

router = APIRouter()
logger = get_logger("api.domains")


@router.post("", response_model=DomainResponse)
async def create_domain(
    data: DomainCreate,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user),
):
    logger.info("create_domain", url=data.url, user_id=user.id)
    sb = get_supabase()

    # Check duplicate
    existing = sb.table("domains").select("id").eq("user_id", user.id).eq("url", data.url).execute()
    if existing.data:
        raise ValidationError("Domain already registered")

    result = sb.table("domains").insert({
        "user_id": user.id,
        "url": data.url,
        "crawl_status": "pending",
    }).execute()

    domain = result.data[0]
    background_tasks.add_task(_run_crawl_and_analyze, domain["id"], user.id)
    return domain


@router.get("", response_model=list[DomainResponse])
async def list_domains(user: AuthenticatedUser = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("domains").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return result.data


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(domain_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("domains").select("*").eq("id", domain_id).eq("user_id", user.id).execute()
    if not result.data:
        raise NotFoundError("Domain", domain_id)
    return result.data[0]


@router.delete("/{domain_id}")
async def delete_domain(domain_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("domains").delete().eq("id", domain_id).eq("user_id", user.id).execute()
    if not result.data:
        raise NotFoundError("Domain", domain_id)
    return {"deleted": True}


@router.post("/{domain_id}/recrawl", response_model=DomainResponse)
async def recrawl_domain(
    domain_id: str,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    result = sb.table("domains").select("*").eq("id", domain_id).eq("user_id", user.id).execute()
    if not result.data:
        raise NotFoundError("Domain", domain_id)

    sb.table("domains").update({"crawl_status": "pending"}).eq("id", domain_id).execute()
    background_tasks.add_task(_run_crawl_and_analyze, domain_id, user.id)

    updated = sb.table("domains").select("*").eq("id", domain_id).execute()
    return updated.data[0]


async def _run_crawl_and_analyze(domain_id: str, user_id: str):
    sb = get_supabase()
    logger.info("crawl_task_started", domain_id=domain_id)

    try:
        sb.table("domains").update({"crawl_status": "crawling"}).eq("id", domain_id).execute()

        domain_row = sb.table("domains").select("url").eq("id", domain_id).execute()
        url = domain_row.data[0]["url"]

        crawl_data = await crawl_domain(url)

        llm = get_llm_provider()
        profile = llm.analyze_brand(crawl_data)

        sb.table("domains").update({
            "company_name": profile.company_name,
            "industry": profile.industry,
            "target_audience": profile.target_audience,
            "brand_voice": profile.brand_voice,
            "brand_summary": profile.brand_summary,
            "key_topics": profile.key_topics,
            "crawl_status": "completed",
            "pages_crawled": crawl_data["pages_crawled"],
        }).eq("id", domain_id).execute()

        logger.info("crawl_task_completed", domain_id=domain_id, pages=crawl_data["pages_crawled"])

    except Exception as e:
        logger.error("crawl_task_failed", domain_id=domain_id, error=str(e))
        sb.table("domains").update({
            "crawl_status": "failed",
            "crawl_error": str(e)[:1000],
        }).eq("id", domain_id).execute()
