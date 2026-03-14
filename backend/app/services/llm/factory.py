from functools import lru_cache
from app.services.llm.base import LLMProvider
from app.services.llm.gemini_provider import GeminiProvider


@lru_cache()
def get_llm_provider(provider_name: str = "gemini") -> LLMProvider:
    providers: dict[str, type[LLMProvider]] = {
        "gemini": GeminiProvider,
    }
    provider_class = providers.get(provider_name)
    if not provider_class:
        raise ValueError(f"Unknown LLM provider: {provider_name}. Available: {list(providers.keys())}")
    return provider_class()
