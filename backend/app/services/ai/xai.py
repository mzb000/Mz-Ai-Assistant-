from typing import AsyncIterator, List, Optional
from openai import AsyncOpenAI
from app.services.ai.base import AIProvider, AIProviderFactory

XAI_BASE_URL = "https://api.x.ai/v1"


class XAIProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.client = AsyncOpenAI(api_key=api_key, base_url=XAI_BASE_URL)

    async def chat(
        self,
        messages: List[dict],
        model: str = "grok-3",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield delta.content

    async def get_available_models(self) -> List[str]:
        return [
            "grok-3",
            "grok-3-mini",
            "grok-2",
        ]


AIProviderFactory.register("xai", XAIProvider)
