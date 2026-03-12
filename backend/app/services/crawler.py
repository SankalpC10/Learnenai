"""
Domain Crawler Service
Crawls a website to extract brand context for AI blog generation.
"""
import json
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from app.core.config import get_settings

settings = get_settings()


async def crawl_domain(url: str) -> dict:
    """
    Crawl a domain and extract text content from up to MAX_PAGES_TO_CRAWL pages.
    
    Returns a dict with:
        - pages_crawled: int
        - extracted_text: str (concatenated text from all pages)
        - page_titles: list[str]
        - meta_descriptions: list[str]
        - headings: list[str]
    """
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    base_domain = urlparse(url).netloc
    visited = set()
    to_visit = [url]
    
    all_titles = []
    all_meta_descs = []
    all_headings = []
    all_text_chunks = []
    
    async with httpx.AsyncClient(
        timeout=settings.CRAWL_TIMEOUT_SECONDS,
        follow_redirects=True,
        headers={"User-Agent": "LernenAI-Crawler/1.0 (SEO Audit Bot)"}
    ) as client:
        while to_visit and len(visited) < settings.MAX_PAGES_TO_CRAWL:
            current_url = to_visit.pop(0)
            
            if current_url in visited:
                continue
            
            try:
                response = await client.get(current_url)
                if response.status_code != 200:
                    continue
                if "text/html" not in response.headers.get("content-type", ""):
                    continue
                    
                visited.add(current_url)
                soup = BeautifulSoup(response.text, "lxml")
                
                # Extract title
                title_tag = soup.find("title")
                if title_tag and title_tag.string:
                    all_titles.append(title_tag.string.strip())
                
                # Extract meta description
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if meta_desc and meta_desc.get("content"):
                    all_meta_descs.append(meta_desc["content"].strip())
                
                # Extract headings
                for tag in ["h1", "h2", "h3"]:
                    for heading in soup.find_all(tag):
                        text = heading.get_text(strip=True)
                        if text:
                            all_headings.append(f"[{tag.upper()}] {text}")
                
                # Extract body text (paragraphs, list items)
                for p in soup.find_all(["p", "li"]):
                    text = p.get_text(strip=True)
                    if len(text) > 20:  # Skip very short fragments
                        all_text_chunks.append(text)
                
                # Find internal links to crawl next
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"]
                    full_url = urljoin(current_url, href)
                    parsed = urlparse(full_url)
                    
                    if (
                        parsed.netloc == base_domain
                        and full_url not in visited
                        and not any(ext in parsed.path for ext in [".pdf", ".jpg", ".png", ".css", ".js"])
                        and "#" not in full_url
                    ):
                        to_visit.append(full_url)
                        
            except (httpx.RequestError, httpx.HTTPStatusError):
                continue
    
    # Combine and truncate to stay within LLM context limits
    combined_text = "\n".join(all_text_chunks[:200])  # Cap at 200 paragraphs
    
    return {
        "pages_crawled": len(visited),
        "extracted_text": combined_text[:15000],  # ~4K tokens
        "page_titles": all_titles,
        "meta_descriptions": all_meta_descs,
        "headings": all_headings[:100],
    }
