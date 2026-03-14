from pydantic import BaseModel


class BlogGenerateRequest(BaseModel):
    domain_id: str
    keyword_id: str | None = None
    custom_keyword: str | None = None
    custom_title: str | None = None
    word_count: int = 1500


class BlogUpdateRequest(BaseModel):
    title: str | None = None
    meta_description: str | None = None
    body_html: str | None = None


class BlogPublishRequest(BaseModel):
    wp_url: str | None = None
    wp_username: str | None = None
    wp_password: str | None = None
    publish_status: str = "draft"


class BlogResponse(BaseModel):
    id: str
    domain_id: str
    title: str
    slug: str
    meta_description: str | None = None
    body_html: str | None = None
    target_keyword: str | None = None
    search_volume: int | None = None
    difficulty: str | None = None
    word_count: int | None = None
    status: str = "draft"
    wp_post_id: int | None = None
    wp_url: str | None = None
    created_at: str | None = None
