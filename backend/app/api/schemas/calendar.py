from pydantic import BaseModel


class CalendarGenerateRequest(BaseModel):
    domain_id: str
    start_date: str  # ISO format: 2026-03-15
    weeks: int = 4
    posts_per_week: int = 2


class CalendarItemUpdate(BaseModel):
    title: str | None = None
    target_keyword: str | None = None
    scheduled_date: str | None = None
    status: str | None = None
    notes: str | None = None


class CalendarItemResponse(BaseModel):
    id: str
    domain_id: str
    title: str
    target_keyword: str | None = None
    scheduled_date: str
    status: str = "idea"
    blog_post_id: str | None = None
    notes: str | None = None
    created_at: str | None = None
