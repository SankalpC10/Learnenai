from pydantic import BaseModel


class DomainCreate(BaseModel):
    url: str


class DomainResponse(BaseModel):
    id: str
    url: str
    company_name: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    brand_voice: str | None = None
    brand_summary: str | None = None
    key_topics: list[str] = []
    crawl_status: str = "pending"
    crawl_error: str | None = None
    pages_crawled: int = 0
    created_at: str | None = None
