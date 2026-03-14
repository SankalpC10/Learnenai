"""
WordPress Publisher Service
"""
import httpx
from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.exceptions import ExternalServiceError

logger = get_logger("wordpress_publisher")
settings = get_settings()


async def publish_to_wordpress(
    title: str, body_html: str, slug: str,
    meta_description: str = "", status: str = "draft",
    wp_url: str | None = None, wp_username: str | None = None, wp_password: str | None = None,
) -> dict:
    site_url = (wp_url or settings.WP_SITE_URL).rstrip("/")
    username = wp_username or settings.WP_USERNAME
    password = wp_password or settings.WP_APP_PASSWORD

    if not site_url or not username or not password:
        raise ExternalServiceError("WordPress", "Credentials not configured")

    post_data: dict = {"title": title, "content": body_html, "slug": slug, "status": status, "format": "standard"}
    if meta_description:
        post_data["meta"] = {"_yoast_wpseo_metadesc": meta_description}

    logger.info("publishing_to_wordpress", site=site_url, title=title)

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{site_url}/wp-json/wp/v2/posts", json=post_data,
            auth=(username, password), headers={"Content-Type": "application/json"},
        )
        if response.status_code not in (200, 201):
            raise ExternalServiceError("WordPress", f"API error ({response.status_code}): {response.text[:500]}")

        result = response.json()
        logger.info("wordpress_published", wp_id=result.get("id"))
        return {"wp_post_id": result.get("id"), "wp_url": result.get("link", ""), "status": result.get("status", status)}


async def check_wordpress_connection(
    wp_url: str | None = None, wp_username: str | None = None, wp_password: str | None = None,
) -> dict:
    site_url = (wp_url or settings.WP_SITE_URL).rstrip("/")
    username = wp_username or settings.WP_USERNAME
    password = wp_password or settings.WP_APP_PASSWORD
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{site_url}/wp-json/wp/v2/users/me", auth=(username, password))
            if response.status_code == 200:
                user = response.json()
                return {"connected": True, "user": user.get("name", "Unknown"), "site_url": site_url}
            return {"connected": False, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"connected": False, "error": str(e)}
