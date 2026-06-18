from typing import AsyncIterator, List, Optional
from openai import AsyncOpenAI
from app.services.ai.base import AIProvider, AIProviderFactory

TOGETHER_BASE_URL = "https://api.together.xyz/v1"


class TogetherProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.client = AsyncOpenAI(api_key=api_key, base_url=TOGETHER_BASE_URL)

    async def chat(
        self,
        messages: List[dict],
        model: str = "meta-llama/Llama-3.3-70B-Instruct-Turbo",
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
            "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            "mistralai/Mixtral-8x7B-Instruct-v0.1",
            "Qwen/Qwen2.5-72B-Instruct-Turbo",
            "deepseek-ai/DeepSeek-R1",
        ]


AIProviderFactory.register("together", TogetherProvider)
