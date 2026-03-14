"""
Blog Post Generator Service
"""
import re
from app.services.llm.base import LLMProvider
from app.core.logging import get_logger

logger = get_logger("blog_generator")


class BlogGeneratorService:
    def __init__(self, llm: LLMProvider):
        self._llm = llm

    async def generate_blog_post(
        self, keyword: str, suggested_title: str, brand_profile: dict, word_count: int = 1500
    ) -> dict:
        logger.info("generating_blog_post", keyword=keyword, word_count=word_count)

        result = self._llm.generate_blog_post(
            keyword=keyword,
            title=suggested_title,
            brand_profile=brand_profile,
            word_count=word_count,
        )

        slug = self._generate_slug(result.title or keyword)
        text_only = re.sub(r"<[^>]+>", "", result.body_html)
        actual_word_count = len(text_only.split())

        return {
            "title": result.title,
            "slug": slug,
            "meta_description": result.meta_description[:320],
            "body_html": result.body_html,
            "word_count": actual_word_count,
        }

    @staticmethod
    def _generate_slug(title: str) -> str:
        slug = title.lower()
        slug = re.sub(r"[^a-z0-9\s-]", "", slug)
        slug = re.sub(r"[\s]+", "-", slug)
        slug = re.sub(r"-+", "-", slug)
        return slug.strip("-")[:100]
