from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    APP_NAME: str = "LernenAI"
    DEBUG: bool = True

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_MODEL_LITE: str = "gemini-2.0-flash-lite"

    # DataForSEO (optional)
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""

    # WordPress (optional)
    WP_SITE_URL: str = ""
    WP_USERNAME: str = ""
    WP_APP_PASSWORD: str = ""

    # Crawler
    MAX_PAGES_TO_CRAWL: int = 20
    CRAWL_TIMEOUT_SECONDS: int = 30


@lru_cache()
def get_settings() -> Settings:
    return Settings()
