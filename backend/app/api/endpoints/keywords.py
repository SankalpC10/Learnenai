"""
Keyword Suggestion API Endpoints
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.domain import Domain, Keyword, CrawlStatus
from app.services.keyword_service import suggest_keywords

router = APIRouter()


# --- Schemas ---

class KeywordSuggestRequest(BaseModel):
    domain_id: int
    count: int = 15

class KeywordResponse(BaseModel):
    id: int
    domain_id: int
    keyword: str
    search_volume: int | None = None
    difficulty: str | None = None
    suggested_title: str | None = None
    used: bool = False

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.post("/suggest", response_model=list[KeywordResponse])
async def suggest(
    data: KeywordSuggestRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate keyword suggestions for a domain."""
    domain = await db.get(Domain, data.domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    if domain.crawl_status != CrawlStatus.COMPLETED:
        raise HTTPException(status_code=400, detail=f"Domain crawl not completed. Status: {domain.crawl_status.value}")
    
    # Build brand profile dict from domain
    topics = []
    if domain.key_topics:
        try:
            topics = json.loads(domain.key_topics)
        except (json.JSONDecodeError, TypeError):
            topics = []
    
    brand_profile = {
        "company_name": domain.company_name,
        "industry": domain.industry,
        "target_audience": domain.target_audience,
        "brand_voice": domain.brand_voice,
        "key_topics": topics,
        "brand_summary": domain.brand_summary,
    }
    
    suggestions = await suggest_keywords(brand_profile, count=data.count)
    
    # Save to database
    saved_keywords = []
    for kw in suggestions:
        # Map volume estimate to rough number
        volume = kw.get("search_volume")
        if not isinstance(volume, int):
            volume_map = {"Low": 200, "Medium": 1000, "High": 5000}
            volume = volume_map.get(kw.get("search_volume_estimate", "Low"), 200)
        
        keyword_record = Keyword(
            domain_id=data.domain_id,
            keyword=kw["keyword"],
            search_volume=volume,
            difficulty=kw.get("difficulty_estimate", "Medium"),
            suggested_title=kw.get("suggested_title"),
        )
        db.add(keyword_record)
        saved_keywords.append(keyword_record)
    
    await db.commit()
    
    # Refresh to get IDs
    for kw in saved_keywords:
        await db.refresh(kw)
    
    return saved_keywords


@router.get("", response_model=list[KeywordResponse])
async def list_keywords(
    domain_id: int,
    db: AsyncSession = Depends(get_db),
):
    """List all keywords for a domain."""
    result = await db.execute(
        select(Keyword)
        .where(Keyword.domain_id == domain_id)
        .order_by(Keyword.search_volume.desc())
    )
    return result.scalars().all()
