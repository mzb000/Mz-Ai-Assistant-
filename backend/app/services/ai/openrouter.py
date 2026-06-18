from typing import AsyncIterator, List, Optional
from openai import AsyncOpenAI
from app.services.ai.base import AIProvider, AIProviderFactory

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class OpenRouterProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.client = AsyncOpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)

    async def chat(
        self,
        messages: List[dict],
        model: str = "openai/gpt-4o",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream,
            extra_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "Zabi AI Assistant"},
        )
        async for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield delta.content

    async def get_available_models(self) -> List[str]:
        return [
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "openai/gpt-4-turbo",
            "anthropic/claude-3.5-sonnet",
            "anthropic/claude-3-haiku",
            "google/gemini-2.0-flash",
            "meta-llama/llama-3.2-3b-instruct",
        ]


AIProviderFactory.register("openrouter", OpenRouterProvider)
