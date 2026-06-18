from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.core.database import get_db, async_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import ChatRequest, RenameRequest, ConversationResponse, ConversationListResponse
from app.services.ai.base import AIProviderFactory
from app.services.rag.rag_engine import rag_chat
from app.services.offline_responses import get_offline_response
from app.core.config import settings
import json

router = APIRouter(prefix="/api/chat", tags=["chat"])

_PROVIDER_KEY_MAP = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "groq": "GROQ_API_KEY",
    "mistral": "MISTRAL_API_KEY",
    "cohere": "COHERE_API_KEY",
    "together": "TOGETHER_API_KEY",
    "xai": "XAI_API_KEY",
}


def _get_api_key(provider: str) -> str:
    attr = _PROVIDER_KEY_MAP.get(provider)
    if not attr:
        return None
    key = getattr(settings, attr, None)
    return key if key and key.strip() else None


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.conversation_id:
        conv = Conversation(user_id=user.id, provider=payload.provider, model=payload.model)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        payload.conversation_id = conv.id
    else:
        result = await db.execute(
            select(Conversation).where(Conversation.id == payload.conversation_id, Conversation.user_id == user.id)
        )
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

    user_msg = Message(conversation_id=payload.conversation_id, role="user", content=payload.message)
    db.add(user_msg)
    await db.commit()

    history_result = await db.execute(
        select(Message).where(Message.conversation_id == payload.conversation_id).order_by(Message.created_at)
    )
    history = history_result.scalars().all()
    messages = [{"role": m.role, "content": m.content} for m in history]

    if payload.system_prompt:
        messages.insert(0, {"role": "system", "content": payload.system_prompt})

    api_key = _get_api_key(payload.provider)

    async def generate():
        full_response = ""

        if not api_key and payload.provider != "ollama":
            offline = get_offline_response(payload.message)
            if offline:
                full_response = offline
                yield f"data: {json.dumps({'content': offline, 'conversation_id': payload.conversation_id})}\n\n"

        if not full_response:
            try:
                if payload.document_ids:
                    stream = rag_chat(
                        provider_name=payload.provider,
                        model=payload.model,
                        messages=messages,
                        document_ids=payload.document_ids,
                        query=payload.message,
                        api_key=api_key,
                    )
                else:
                    provider = AIProviderFactory.create(payload.provider, api_key=api_key)
                    stream = provider.chat(messages, payload.model)

                async for chunk in stream:
                    full_response += chunk
                    yield f"data: {json.dumps({'content': chunk, 'conversation_id': payload.conversation_id})}\n\n"

            except Exception as e:
                err_msg = str(e)
                if not api_key and payload.provider != "ollama":
                    err_msg = "API key required. Go to Settings and add your API key, then restart the backend."
                elif "401" in err_msg or "unauthorized" in err_msg.lower() or "invalid" in err_msg.lower():
                    err_msg = f"Invalid API key for {payload.provider}. Check your key in Settings."
                elif "402" in err_msg or "Insufficient Balance" in err_msg:
                    err_msg = f"{payload.provider} account has insufficient balance. Top up your account."
                elif "429" in err_msg or "rate" in err_msg.lower():
                    err_msg = f"Rate limited by {payload.provider}. Please wait a moment and try again."
                elif "model" in err_msg.lower() and ("not found" in err_msg.lower() or "does not exist" in err_msg.lower()):
                    err_msg = f"Model '{payload.model}' not available for {payload.provider}. Try a different model in Settings."
                full_response = err_msg
                yield f"data: {json.dumps({'content': err_msg, 'conversation_id': payload.conversation_id})}\n\n"

        # Use a fresh DB session for post-stream work because the
        # dependency-injected session (from get_db) is closed by FastAPI
        # once chat_stream() returns the StreamingResponse — before
        # this generator even starts executing.
        async with async_session() as gen_db:
            assistant_msg = Message(
                conversation_id=payload.conversation_id, role="assistant", content=full_response
            )
            gen_db.add(assistant_msg)
            await gen_db.commit()

            if len(history) <= 2 and full_response and "API key" not in full_response:
                words = payload.message.strip().split()
                fallback_title = (" ".join(words[:6]))[:255] if words else "New Chat"

                await gen_db.execute(
                    update(Conversation)
                    .where(Conversation.id == payload.conversation_id)
                    .values(title=fallback_title)
                )
                await gen_db.commit()

                if api_key or payload.provider == "ollama":
                    try:
                        title_prompt = (
                            "Generate a short title (max 6 words, no quotes) for this "
                            "conversation. Reply with ONLY the title, nothing else: "
                            + payload.message[:200]
                        )
                        title_provider = AIProviderFactory.create(payload.provider, api_key=api_key)
                        title_gen = title_provider.chat(
                            [{"role": "user", "content": title_prompt}], payload.model
                        )
                        ai_title = ""
                        async for t in title_gen:
                            ai_title += t
                        ai_title = ai_title.strip().strip('"').strip("'")[:255]
                        if ai_title:
                            await gen_db.execute(
                                update(Conversation)
                                .where(Conversation.id == payload.conversation_id)
                                .values(title=ai_title)
                            )
                            await gen_db.commit()
                    except Exception:
                        pass

        yield f"data: {json.dumps({'done': True, 'conversation_id': payload.conversation_id})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/conversations", response_model=list[ConversationListResponse])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    search: str = Query(default=None, description="Search conversations by title"),
):
    query = select(Conversation).where(Conversation.user_id == user.id)
    if search:
        query = query.where(Conversation.title.ilike(f"%{search}%"))
    query = query.order_by(Conversation.updated_at.desc())
    result = await db.execute(query)
    convs = result.scalars().all()

    response = []
    for conv in convs:
        count_result = await db.execute(
            select(func.count()).where(Message.conversation_id == conv.id, Message.role == "user")
        )
        count = count_result.scalar() or 0
        response.append(ConversationListResponse(
            id=conv.id, title=conv.title, provider=conv.provider,
            model=conv.model, created_at=conv.created_at,
            updated_at=conv.updated_at, message_count=count,
        ))
    return response


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    )
    messages = msg_result.scalars().all()
    return ConversationResponse(
        id=conv.id, title=conv.title, provider=conv.provider,
        model=conv.model, created_at=conv.created_at,
        updated_at=conv.updated_at, messages=messages,
    )


@router.patch("/conversations/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    payload: RenameRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = payload.title[:255]
    await db.commit()
    return {"id": conv.id, "title": conv.title}


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.execute(
        Message.__table__.delete().where(Message.conversation_id == conversation_id)
    )
    await db.delete(conv)
    await db.commit()


@router.delete("/conversations", status_code=204)
async def clear_all_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.user_id == user.id)
    )
    convs = result.scalars().all()
    for conv in convs:
        await db.execute(
            Message.__table__.delete().where(Message.conversation_id == conv.id)
        )
        await db.delete(conv)
    await db.commit()


@router.get("/conversations/{conversation_id}/export")
async def export_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    )
    messages = msg_result.scalars().all()

    export_data = {
        "title": conv.title,
        "provider": conv.provider,
        "model": conv.model,
        "created_at": conv.created_at.isoformat(),
        "messages": [
            {"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
            for m in messages
        ],
    }
    return JSONResponse(content=export_data)
