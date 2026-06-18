from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.dependencies import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/api/settings", tags=["settings"])

_DEFAULT_MODELS = {
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini"],
    "anthropic": ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-4-20250414", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
    "openrouter": ["openai/gpt-4o", "openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash", "meta-llama/llama-3.3-70b-instruct"],
    "deepseek": ["deepseek-chat", "deepseek-reasoner"],
    "gemini": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"],
    "groq": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768", "deepseek-r1-distill-llama-70b"],
    "mistral": ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-nemo", "codestral-latest"],
    "cohere": ["command-r-plus", "command-r", "command-a-03-2025"],
    "together": ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1", "Qwen/Qwen2.5-72B-Instruct-Turbo", "deepseek-ai/DeepSeek-R1"],
    "xai": ["grok-3", "grok-3-mini", "grok-2"],
    "ollama": ["llama3.2", "llama3.1", "mistral", "codellama", "phi3", "gemma2"],
}

_PROVIDER_CONFIGS = [
    {"id": "openai", "name": "OpenAI", "key_attr": "OPENAI_API_KEY"},
    {"id": "anthropic", "name": "Anthropic", "key_attr": "ANTHROPIC_API_KEY"},
    {"id": "openrouter", "name": "OpenRouter", "key_attr": "OPENROUTER_API_KEY"},
    {"id": "deepseek", "name": "DeepSeek", "key_attr": "DEEPSEEK_API_KEY"},
    {"id": "gemini", "name": "Google Gemini", "key_attr": "GEMINI_API_KEY"},
    {"id": "groq", "name": "Groq", "key_attr": "GROQ_API_KEY"},
    {"id": "mistral", "name": "Mistral AI", "key_attr": "MISTRAL_API_KEY"},
    {"id": "cohere", "name": "Cohere", "key_attr": "COHERE_API_KEY"},
    {"id": "together", "name": "Together AI", "key_attr": "TOGETHER_API_KEY"},
    {"id": "xai", "name": "xAI (Grok)", "key_attr": "XAI_API_KEY"},
    {"id": "ollama", "name": "Ollama (Local)", "key_attr": None},
]


class ApiKeyUpdate(BaseModel):
    provider: str
    api_key: str


@router.get("/providers")
async def get_providers(user: User = Depends(get_current_user)):
    result = []
    for p in _PROVIDER_CONFIGS:
        has_key = False
        if p["key_attr"]:
            val = getattr(settings, p["key_attr"], None)
            has_key = bool(val and val.strip())
        elif p["id"] == "ollama":
            has_key = True

        result.append({
            "id": p["id"],
            "name": p["name"],
            "has_key": has_key,
            "models": _DEFAULT_MODELS.get(p["id"], []),
        })
    return result


@router.post("/api-key")
async def update_api_key(payload: ApiKeyUpdate, user: User = Depends(get_current_user)):
    key_map = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "deepseek": "DEEPSEEK_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "groq": "GROQ_API_KEY",
        "mistral": "MISTRAL_API_KEY",
        "cohere": "COHERE_API_KEY",
        "together": "TOGETHER_API_KEY",
        "xai": "XAI_API_KEY",
    }
    attr = key_map.get(payload.provider)
    if not attr:
        return {"error": "Unknown provider"}

    setattr(settings, attr, payload.api_key)
    return {"status": "ok", "provider": payload.provider}
