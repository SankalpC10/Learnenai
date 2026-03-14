from pydantic import BaseModel


class KeywordSuggestRequest(BaseModel):
    domain_id: str
    count: int = 15


class KeywordResponse(BaseModel):
    id: str
    domain_id: str
    keyword: str
    search_volume: int | None = None
    difficulty: str | None = None
    suggested_title: str | None = None
    used: bool = False
    created_at: str | None = None
