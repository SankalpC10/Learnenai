"""
Keyword Research Service
Generates keyword suggestions using Gemini structured outputs + optional DataForSEO.
"""
from app.services.llm_service import suggest_keywords_llm
from app.core.config import get_settings

settings = get_settings()


async def suggest_keywords(brand_profile: dict, count: int = 15) -> list[dict]:
    """
    Generate keyword suggestions based on a brand profile.
    Uses Gemini structured output, optionally enriched with DataForSEO.
    """
    # Step 1: LLM keyword generation (sync call)
    suggestions = suggest_keywords_llm(brand_profile, count=count)
    
    # Step 2: Optional DataForSEO enrichment
    if settings.DATAFORSEO_LOGIN and settings.DATAFORSEO_PASSWORD:
        suggestions = await _enrich_with_dataforseo(suggestions)
    
    return suggestions


async def _enrich_with_dataforseo(keywords: list[dict]) -> list[dict]:
    """
    Enrich keyword suggestions with real search volume data from DataForSEO.
    Falls back gracefully to LLM estimates if API call fails.
    """
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            keyword_list = [kw["keyword"] for kw in keywords]
            
            response = await client.post(
                "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
                auth=(settings.DATAFORSEO_LOGIN, settings.DATAFORSEO_PASSWORD),
                json=[{
                    "keywords": keyword_list,
                    "language_code": "en",
                    "location_code": 2840  # US
                }]
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("tasks", [{}])[0].get("result", [])
                
                volume_map = {}
                for item in results:
                    if item and item.get("keyword"):
                        volume_map[item["keyword"]] = {
                            "search_volume": item.get("search_volume", 0),
                            "competition": item.get("competition", "UNKNOWN"),
                        }
                
                for kw in keywords:
                    real_data = volume_map.get(kw["keyword"])
                    if real_data:
                        kw["search_volume"] = real_data["search_volume"]
                        kw["difficulty_estimate"] = real_data["competition"]
                        
    except Exception:
        pass  # Fallback to LLM estimates silently
    
    return keywords
