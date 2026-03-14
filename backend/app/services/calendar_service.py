"""
Content Calendar Service
"""
from datetime import date, timedelta
from app.services.llm.base import LLMProvider
from app.core.logging import get_logger

logger = get_logger("calendar_service")


class CalendarService:
    def __init__(self, llm: LLMProvider):
        self._llm = llm

    async def generate_calendar(
        self,
        brand_profile: dict,
        existing_keywords: list[str],
        start_date: date,
        weeks: int = 4,
        posts_per_week: int = 2,
    ) -> list[dict]:
        logger.info("generating_calendar", weeks=weeks, posts_per_week=posts_per_week)

        suggestions = self._llm.suggest_calendar(
            brand_profile=brand_profile,
            existing_keywords=existing_keywords,
            weeks=weeks,
        )

        calendar_items = []
        current_date = start_date

        for i, suggestion in enumerate(suggestions):
            calendar_items.append({
                "title": suggestion.title,
                "target_keyword": suggestion.target_keyword,
                "scheduled_date": current_date.isoformat(),
                "status": "idea",
                "notes": suggestion.content_angle,
            })
            if (i + 1) % posts_per_week == 0:
                current_date += timedelta(weeks=1)
            else:
                current_date += timedelta(days=3)

        return calendar_items
