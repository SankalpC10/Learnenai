import datetime
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


# --- Enums ---

class CrawlStatus(str, enum.Enum):
    PENDING = "pending"
    CRAWLING = "crawling"
    COMPLETED = "completed"
    FAILED = "failed"


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    PUBLISHED = "published"
    FAILED = "failed"


# --- Models ---

class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_audience: Mapped[str | None] = mapped_column(Text, nullable=True)
    brand_voice: Mapped[str | None] = mapped_column(String(100), nullable=True)  # formal/casual/technical
    brand_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_topics: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string of topics
    crawl_status: Mapped[CrawlStatus] = mapped_column(
        SAEnum(CrawlStatus), default=CrawlStatus.PENDING, nullable=False
    )
    crawl_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    pages_crawled: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    # Relationships
    keywords: Mapped[list["Keyword"]] = relationship(back_populates="domain", cascade="all, delete-orphan")
    blog_posts: Mapped[list["BlogPost"]] = relationship(back_populates="domain", cascade="all, delete-orphan")


class Keyword(Base):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"), nullable=False)
    keyword: Mapped[str] = mapped_column(String(500), nullable=False)
    search_volume: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)  # Low/Medium/High or 0-100
    suggested_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    # Relationships
    domain: Mapped["Domain"] = relationship(back_populates="keywords")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False)
    meta_description: Mapped[str | None] = mapped_column(String(320), nullable=True)
    body_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_keyword: Mapped[str | None] = mapped_column(String(500), nullable=True)
    search_volume: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[PostStatus] = mapped_column(
        SAEnum(PostStatus), default=PostStatus.DRAFT, nullable=False
    )
    wp_post_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wp_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    # Relationships
    domain: Mapped["Domain"] = relationship(back_populates="blog_posts")
