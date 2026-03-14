from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import setup_logging
from app.core.config import get_settings
from app.core.exceptions import AppError, app_error_handler
from app.api.endpoints import domains, keywords, blogs, calendar, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    setup_logging(debug=settings.DEBUG)
    yield


app = FastAPI(
    title="LernenAI API",
    description="AI Blog Generation Platform — Automated SEO content at scale",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(domains.router, prefix="/api/v1/domains", tags=["Domains"])
app.include_router(keywords.router, prefix="/api/v1/keywords", tags=["Keywords"])
app.include_router(blogs.router, prefix="/api/v1/blogs", tags=["Blogs"])
app.include_router(calendar.router, prefix="/api/v1/calendar", tags=["Calendar"])


@app.get("/")
def root():
    return {"name": "LernenAI API", "version": "2.0.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
