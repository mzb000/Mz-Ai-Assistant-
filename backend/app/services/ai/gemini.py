from typing import AsyncIterator, List, Optional
import asyncio
from google import genai
from google.genai import types
from app.services.ai.base import AIProvider, AIProviderFactory


class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.client = genai.Client(api_key=api_key)

    async def chat(
        self,
        messages: List[dict],
        model: str = "gemini-2.0-flash",
        stream: bool = True,
    ) -> AsyncIterator[str]:
        contents = self._build_contents(messages)
        system_instruction = None
        for m in messages:
            if m["role"] == "system":
                system_instruction = m["content"]
                break

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
        ) if system_instruction else None

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: list(self.client.models.generate_content_stream(
                model=model, contents=contents, config=config,
            ))
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text

    def _build_contents(self, messages: List[dict]) -> list:
        contents = []
        for m in messages:
            if m["role"] == "system":
                continue
            role = "user" if m["role"] == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part(text=m["content"])]
            ))
        return contents

    async def get_available_models(self) -> List[str]:
        return [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ]


AIProviderFactory.register("gemini", GeminiProvider)
