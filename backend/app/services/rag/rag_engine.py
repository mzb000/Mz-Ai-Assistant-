from app.services.document.retriever import retrieve_context
from app.services.ai.base import AIProviderFactory
from typing import AsyncIterator


async def rag_chat(
    provider_name: str,
    model: str,
    messages: list[dict],
    document_ids: list[str],
    query: str,
    api_key: str = None,
    base_url: str = None,
) -> AsyncIterator[str]:
    context = retrieve_context(query, document_ids)

    system_prompt = "You are Zabi, a helpful AI assistant. Answer the user's questions based on the provided context."
    if context:
        system_prompt += f"\n\nUse the following context to answer:\n{context}"

    rag_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg["role"] != "system":
            rag_messages.append(msg)

    provider = AIProviderFactory.create(provider_name, api_key=api_key, base_url=base_url)
    async for chunk in provider.chat(rag_messages, model):
        yield chunk
