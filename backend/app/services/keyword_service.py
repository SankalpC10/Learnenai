"""
Keyword Research Service
"""
import httpx
from app.services.llm.base import LLMProvider
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("keyword_service")


class KeywordService:
    def __init__(self, llm: LLMProvider):
        self._llm = llm

    async def suggest_keywords(self, brand_profile: dict, count: int = 15) -> list[dict]:
        logger.info("suggesting_keywords", company=brand_profile.get("company_name"), count=count)
        suggestions = self._llm.suggest_keywords(brand_profile, count=count)
        result = [s.model_dump() for s in suggestions]

        settings = get_settings()
        if settings.DATAFORSEO_LOGIN and settings.DATAFORSEO_PASSWORD:
            result = await self._enrich_with_dataforseo(result)

        return result

    async def _enrich_with_dataforseo(self, keywords: list[dict]) -> list[dict]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient() as client:
                keyword_list = [kw["keyword"] for kw in keywords]
                response = await client.post(
                    "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
                    auth=(settings.DATAFORSEO_LOGIN, settings.DATAFORSEO_PASSWORD),
                    json=[{"keywords": keyword_list, "language_code": "en", "location_code": 2840}],
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
        except Exception as e:
            logger.warning("dataforseo_enrichment_failed", error=str(e))
        return keywords
