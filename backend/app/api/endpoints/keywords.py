"""
Keyword Suggestion API Endpoints
"""
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, AuthenticatedUser
from app.core.database import get_supabase
from app.core.exceptions import NotFoundError, ValidationError
from app.core.dependencies import get_keyword_service
from app.core.logging import get_logger
from app.api.schemas.keywords import KeywordSuggestRequest, KeywordResponse
from app.services.keyword_service import KeywordService
from app.services.domain_helpers import build_brand_profile

router = APIRouter()
logger = get_logger("api.keywords")


@router.post("/suggest", response_model=list[KeywordResponse])
async def suggest(
    data: KeywordSuggestRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    keyword_svc: KeywordService = Depends(get_keyword_service),
):
    sb = get_supabase()
    domain_result = sb.table("domains").select("*").eq("id", data.domain_id).eq("user_id", user.id).execute()
    if not domain_result.data:
        raise NotFoundError("Domain", data.domain_id)

    domain = domain_result.data[0]
    if domain["crawl_status"] != "completed":
        raise ValidationError(f"Domain crawl not completed. Status: {domain['crawl_status']}")

    brand_profile = build_brand_profile(domain)
    suggestions = await keyword_svc.suggest_keywords(brand_profile, count=data.count)

    saved = []
    for kw in suggestions:
        volume = kw.get("search_volume")
        if not isinstance(volume, int):
            volume_map = {"Low": 200, "Medium": 1000, "High": 5000}
            volume = volume_map.get(kw.get("search_volume_estimate", "Low"), 200)

        record = sb.table("keywords").insert({
            "domain_id": data.domain_id,
            "user_id": user.id,
            "keyword": kw["keyword"],
            "search_volume": volume,
            "difficulty": kw.get("difficulty_estimate", "Medium"),
            "suggested_title": kw.get("suggested_title"),
        }).execute()
        saved.append(record.data[0])

    return saved


@router.get("", response_model=list[KeywordResponse])
async def list_keywords(
    domain_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("keywords")
        .select("*")
        .eq("domain_id", domain_id)
        .eq("user_id", user.id)
        .order("search_volume", desc=True)
        .execute()
    )
    return result.data
