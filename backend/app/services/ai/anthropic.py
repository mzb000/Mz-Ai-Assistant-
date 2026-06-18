from typing import AsyncIterator, List, Optional
from anthropic import AsyncAnthropic
from app.services.ai.base import AIProvider, AIProviderFactory


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.client = AsyncAnthropic(api_key=api_key)

    async def chat(
        self,
        messages: List[dict],
        model: str = "claude-sonnet-4-20250514",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        system_msg = None
        filtered_messages = []
        for m in messages:
            if m["role"] == "system":
                system_msg = m["content"]
            else:
                filtered_messages.append(m)

        kwargs = dict(
            model=model,
            messages=filtered_messages,
            max_tokens=8192,
        )
        if system_msg:
            kwargs["system"] = system_msg

        async with self.client.messages.stream(**kwargs) as response:
            async for text in response.text_stream:
                yield text

    async def get_available_models(self) -> List[str]:
        return [
            "claude-sonnet-4-20250514",
            "claude-opus-4-20250514",
            "claude-haiku-4-20250414",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
        ]


AIProviderFactory.register("anthropic", AnthropicProvider)
