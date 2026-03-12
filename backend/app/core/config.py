from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "LernenAI"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./lernenai.db"

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    GEMINI_MODEL_LITE: str = "gemini-3-flash-preview"

    # DataForSEO (optional — falls back to LLM estimates)
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""

    # WordPress Publishing
    WP_SITE_URL: str = ""
    WP_USERNAME: str = ""
    WP_APP_PASSWORD: str = ""

    # Crawler
    MAX_PAGES_TO_CRAWL: int = 20
    CRAWL_TIMEOUT_SECONDS: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
