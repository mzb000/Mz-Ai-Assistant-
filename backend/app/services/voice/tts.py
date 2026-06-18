import openai
from app.core.config import settings


_client = None


def get_tts_client():
    global _client
    if _client is None:
        _client = openai.OpenAI(api_key=settings.OPENAI_API_KEY or None)
    return _client


async def synthesize_speech(text: str, voice: str = "alloy") -> bytes:
    response = get_tts_client().audio.speech.create(
        model=settings.TTS_MODEL,
        voice=voice,
        input=text,
    )
    return response.content
