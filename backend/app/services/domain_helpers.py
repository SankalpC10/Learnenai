def build_brand_profile(domain: dict) -> dict:
    """Build brand profile dict from a Supabase domain row."""
    return {
        "company_name": domain.get("company_name"),
        "industry": domain.get("industry"),
        "target_audience": domain.get("target_audience"),
        "brand_voice": domain.get("brand_voice"),
        "key_topics": domain.get("key_topics", []),
        "brand_summary": domain.get("brand_summary"),
    }
