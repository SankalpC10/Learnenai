from functools import lru_cache
from app.services.llm.factory import get_llm_provider
from app.services.keyword_service import KeywordService
from app.services.blog_generator import BlogGeneratorService
from app.services.calendar_service import CalendarService


@lru_cache()
def get_keyword_service() -> KeywordService:
    return KeywordService(llm=get_llm_provider())


@lru_cache()
def get_blog_generator_service() -> BlogGeneratorService:
    return BlogGeneratorService(llm=get_llm_provider())


@lru_cache()
def get_calendar_service() -> CalendarService:
    return CalendarService(llm=get_llm_provider())
