from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.voice.stt import transcribe_audio
from app.services.voice.tts import synthesize_speech

router = APIRouter(prefix="/api/voice", tags=["voice"])


class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "alloy"


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    audio_data = await file.read()
    if not audio_data:
        raise HTTPException(status_code=400, detail="No audio data")
    text = await transcribe_audio(audio_data)
    return {"text": text}


@router.post("/synthesize")
async def synthesize(
    payload: SynthesizeRequest,
    user: User = Depends(get_current_user),
):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    audio = await synthesize_speech(payload.text, payload.voice)
    return Response(content=audio, media_type="audio/mpeg")
