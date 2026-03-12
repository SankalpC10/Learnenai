from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.api.endpoints import domains, keywords, blogs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create database tables."""
    await init_db()
    yield


app = FastAPI(
    title="LernenAI API",
    description="AI Blog Generation Platform — Automated SEO content at scale",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(domains.router, prefix="/api/v1/domains", tags=["Domains"])
app.include_router(keywords.router, prefix="/api/v1/keywords", tags=["Keywords"])
app.include_router(blogs.router, prefix="/api/v1/blogs", tags=["Blogs"])


@app.get("/")
def root():
    return {
        "name": "LernenAI API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
