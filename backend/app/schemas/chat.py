from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    provider: str = "openai"
    model: str = "gpt-4o"
    document_ids: Optional[List[str]] = None
    system_prompt: Optional[str] = None


class RenameRequest(BaseModel):
    title: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    title: str
    provider: str
    model: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = []

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    id: str
    title: str
    provider: str
    model: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    model_config = {"from_attributes": True}
