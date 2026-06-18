from typing import AsyncIterator, List, Optional
import httpx
import json
from app.services.ai.base import AIProvider, AIProviderFactory

COHERE_BASE_URL = "https://api.cohere.com/v2"


class CohereProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key

    async def chat(
        self,
        messages: List[dict],
        model: str = "command-r-plus",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST", f"{COHERE_BASE_URL}/chat", json=payload, headers=headers
            ) as response:
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    if line.startswith("data: "):
                        line = line[6:]
                    try:
                        data = json.loads(line)
                        if data.get("type") == "content-delta":
                            delta = data.get("delta", {})
                            text = delta.get("message", {}).get("content", {}).get("text", "")
                            if text:
                                yield text
                    except (json.JSONDecodeError, KeyError):
                        continue

    async def get_available_models(self) -> List[str]:
        return [
            "command-r-plus",
            "command-r",
            "command-a-03-2025",
        ]


AIProviderFactory.register("cohere", CohereProvider)
