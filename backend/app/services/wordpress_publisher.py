"""
WordPress Publisher Service
Publishes blog posts to WordPress via REST API.
"""
import httpx
from app.core.config import get_settings

settings = get_settings()


async def publish_to_wordpress(
    title: str,
    body_html: str,
    slug: str,
    meta_description: str = "",
    status: str = "draft",
    wp_url: str | None = None,
    wp_username: str | None = None,
    wp_password: str | None = None,
) -> dict:
    """
    Publish a blog post to WordPress via REST API.
    
    Args:
        title: Post title
        body_html: Post content in HTML
        slug: URL slug
        meta_description: SEO meta description (stored via Yoast/RankMath if available)
        status: 'draft' or 'publish'
        wp_url: WordPress site URL (overrides config)
        wp_username: WP username (overrides config)
        wp_password: WP application password (overrides config)
    
    Returns:
        {"wp_post_id": int, "wp_url": str, "status": str}
    """
    site_url = (wp_url or settings.WP_SITE_URL).rstrip("/")
    username = wp_username or settings.WP_USERNAME
    password = wp_password or settings.WP_APP_PASSWORD
    
    if not site_url or not username or not password:
        raise ValueError("WordPress credentials not configured. Set WP_SITE_URL, WP_USERNAME, and WP_APP_PASSWORD.")
    
    api_url = f"{site_url}/wp-json/wp/v2/posts"
    
    post_data = {
        "title": title,
        "content": body_html,
        "slug": slug,
        "status": status,
        "format": "standard",
    }
    
    # If Yoast SEO is active, include meta description via Yoast fields
    if meta_description:
        post_data["meta"] = {
            "_yoast_wpseo_metadesc": meta_description,
        }
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            api_url,
            json=post_data,
            auth=(username, password),
            headers={"Content-Type": "application/json"},
        )
        
        if response.status_code not in (200, 201):
            error_detail = response.text[:500]
            raise Exception(f"WordPress API error ({response.status_code}): {error_detail}")
        
        result = response.json()
        
        return {
            "wp_post_id": result.get("id"),
            "wp_url": result.get("link", ""),
            "status": result.get("status", status),
        }


async def check_wordpress_connection(
    wp_url: str | None = None,
    wp_username: str | None = None,
    wp_password: str | None = None,
) -> dict:
    """
    Test WordPress connection by checking the REST API.
    """
    site_url = (wp_url or settings.WP_SITE_URL).rstrip("/")
    username = wp_username or settings.WP_USERNAME
    password = wp_password or settings.WP_APP_PASSWORD
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{site_url}/wp-json/wp/v2/users/me",
                auth=(username, password),
            )
            
            if response.status_code == 200:
                user = response.json()
                return {
                    "connected": True,
                    "user": user.get("name", "Unknown"),
                    "site_url": site_url,
                }
            else:
                return {"connected": False, "error": f"HTTP {response.status_code}"}
                
    except Exception as e:
        return {"connected": False, "error": str(e)}
