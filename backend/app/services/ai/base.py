from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Optional


class AIProvider(ABC):
    @abstractmethod
    async def chat(
        self,
        messages: List[dict],
        model: str,
        stream: bool = True,
    ) -> AsyncIterator[str]:
        pass

    @abstractmethod
    async def get_available_models(self) -> List[str]:
        pass


class AIProviderFactory:
    _providers: dict = {}

    @classmethod
    def register(cls, name: str, provider_class: type):
        cls._providers[name] = provider_class

    @classmethod
    def create(cls, name: str, api_key: Optional[str] = None, base_url: Optional[str] = None) -> AIProvider:
        provider_class = cls._providers.get(name)
        if not provider_class:
            raise ValueError(f"Unknown provider: {name}")
        return provider_class(api_key=api_key, base_url=base_url)
