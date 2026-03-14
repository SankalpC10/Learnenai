"""
Content Calendar API Endpoints
"""
from calendar import monthrange
from datetime import date
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, AuthenticatedUser
from app.core.database import get_supabase
from app.core.exceptions import NotFoundError, ValidationError
from app.core.dependencies import get_calendar_service, get_blog_generator_service
from app.core.logging import get_logger
from app.api.schemas.calendar import CalendarGenerateRequest, CalendarItemUpdate, CalendarItemResponse
from app.api.schemas.blogs import BlogResponse
from app.services.calendar_service import CalendarService
from app.services.blog_generator import BlogGeneratorService
from app.services.domain_helpers import build_brand_profile

router = APIRouter()
logger = get_logger("api.calendar")


@router.post("/generate", response_model=list[CalendarItemResponse])
async def generate_calendar(
    data: CalendarGenerateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    calendar_svc: CalendarService = Depends(get_calendar_service),
):
    sb = get_supabase()

    domain_result = sb.table("domains").select("*").eq("id", data.domain_id).eq("user_id", user.id).execute()
    if not domain_result.data:
        raise NotFoundError("Domain", data.domain_id)

    domain = domain_result.data[0]
    if domain["crawl_status"] != "completed":
        raise ValidationError("Domain crawl not completed yet")

    brand_profile = build_brand_profile(domain)

    # Get existing keywords to avoid duplicates
    kw_result = sb.table("keywords").select("keyword").eq("domain_id", data.domain_id).execute()
    existing_keywords = [kw["keyword"] for kw in kw_result.data]

    start = date.fromisoformat(data.start_date)
    items = await calendar_svc.generate_calendar(
        brand_profile=brand_profile,
        existing_keywords=existing_keywords,
        start_date=start,
        weeks=data.weeks,
        posts_per_week=data.posts_per_week,
    )

    saved = []
    for item in items:
        record = sb.table("content_calendar").insert({
            "domain_id": data.domain_id,
            "user_id": user.id,
            "title": item["title"],
            "target_keyword": item.get("target_keyword"),
            "scheduled_date": item["scheduled_date"],
            "status": item.get("status", "idea"),
            "notes": item.get("notes"),
        }).execute()
        saved.append(record.data[0])

    return saved


@router.get("", response_model=list[CalendarItemResponse])
async def list_calendar_items(
    domain_id: str,
    month: str | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    query = (
        sb.table("content_calendar")
        .select("*")
        .eq("domain_id", domain_id)
        .eq("user_id", user.id)
    )
    if month:
        year, mon = (int(x) for x in month.split("-"))
        last_day = monthrange(year, mon)[1]
        query = query.gte("scheduled_date", f"{month}-01").lte("scheduled_date", f"{month}-{last_day}")

    result = query.order("scheduled_date").execute()
    return result.data


@router.put("/{item_id}", response_model=CalendarItemResponse)
async def update_calendar_item(
    item_id: str,
    data: CalendarItemUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    existing = sb.table("content_calendar").select("id").eq("id", item_id).eq("user_id", user.id).execute()
    if not existing.data:
        raise NotFoundError("CalendarItem", item_id)

    update_data: dict = {}
    if data.title is not None:
        update_data["title"] = data.title
    if data.target_keyword is not None:
        update_data["target_keyword"] = data.target_keyword
    if data.scheduled_date is not None:
        update_data["scheduled_date"] = data.scheduled_date
    if data.status is not None:
        update_data["status"] = data.status
    if data.notes is not None:
        update_data["notes"] = data.notes

    sb.table("content_calendar").update(update_data).eq("id", item_id).execute()
    result = sb.table("content_calendar").select("*").eq("id", item_id).execute()
    return result.data[0]


@router.delete("/{item_id}")
async def delete_calendar_item(
    item_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    result = sb.table("content_calendar").delete().eq("id", item_id).eq("user_id", user.id).execute()
    if not result.data:
        raise NotFoundError("CalendarItem", item_id)
    return {"deleted": True}


@router.post("/{item_id}/write-post", response_model=BlogResponse)
async def write_post_from_calendar(
    item_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    blog_svc: BlogGeneratorService = Depends(get_blog_generator_service),
):
    """Generate a blog post from a calendar item."""
    sb = get_supabase()

    # Fetch calendar item
    cal_result = sb.table("content_calendar").select("*").eq("id", item_id).eq("user_id", user.id).execute()
    if not cal_result.data:
        raise NotFoundError("CalendarItem", item_id)

    cal_item = cal_result.data[0]
    if cal_item.get("blog_post_id"):
        raise ValidationError("A blog post already exists for this calendar item")

    # Fetch parent domain
    domain_result = sb.table("domains").select("*").eq("id", cal_item["domain_id"]).eq("user_id", user.id).execute()
    if not domain_result.data:
        raise NotFoundError("Domain", cal_item["domain_id"])

    domain = domain_result.data[0]
    if domain["crawl_status"] != "completed":
        raise ValidationError("Domain crawl not completed yet")

    brand_profile = build_brand_profile(domain)
    keyword = cal_item.get("target_keyword") or cal_item["title"]

    logger.info("writing_post_from_calendar", item_id=item_id, keyword=keyword)

    result = await blog_svc.generate_blog_post(
        keyword=keyword,
        suggested_title=cal_item["title"],
        brand_profile=brand_profile,
        word_count=1500,
    )

    # Save blog post
    blog_record = sb.table("blog_posts").insert({
        "domain_id": cal_item["domain_id"],
        "user_id": user.id,
        "title": result["title"],
        "slug": result["slug"],
        "meta_description": result["meta_description"],
        "body_html": result["body_html"],
        "target_keyword": keyword,
        "word_count": result["word_count"],
        "status": "draft",
    }).execute()

    blog_id = blog_record.data[0]["id"]

    # Link calendar item to blog post and update status
    sb.table("content_calendar").update({
        "blog_post_id": blog_id,
        "status": "completed",
    }).eq("id", item_id).execute()

    return blog_record.data[0]
