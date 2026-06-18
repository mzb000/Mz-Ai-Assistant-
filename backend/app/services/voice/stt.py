import tempfile
import os
from pathlib import Path
import openai
from app.core.config import settings


_client = None


def get_stt_client():
    global _client
    if _client is None:
        _client = openai.OpenAI(api_key=settings.OPENAI_API_KEY or None)
    return _client


async def transcribe_audio(audio_data: bytes, language: str = "en") -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_data)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            transcript = get_stt_client().audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
            )
        return transcript.text
    finally:
        os.unlink(tmp_path)
