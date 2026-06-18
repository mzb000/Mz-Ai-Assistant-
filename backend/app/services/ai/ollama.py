from typing import AsyncIterator, List, Optional
import httpx
from app.services.ai.base import AIProvider, AIProviderFactory


class OllamaProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.base_url = base_url or "http://localhost:11434"

    async def chat(
        self,
        messages: List[dict],
        model: str = "llama3.2",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        async with httpx.AsyncClient(base_url=self.base_url, timeout=120) as client:
            payload = {
                "model": model,
                "messages": messages,
                "stream": stream,
            }
            async with client.stream("POST", "/api/chat", json=payload) as response:
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    import json
                    data = json.loads(line)
                    if data.get("done"):
                        break
                    if "message" in data and "content" in data["message"]:
                        yield data["message"]["content"]

    async def get_available_models(self) -> List[str]:
        async with httpx.AsyncClient(base_url=self.base_url) as client:
            response = await client.get("/api/tags")
            data = response.json()
            return [m["name"] for m in data.get("models", [])]


AIProviderFactory.register("ollama", OllamaProvider)
