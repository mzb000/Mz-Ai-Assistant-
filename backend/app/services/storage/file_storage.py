import os
import uuid
import aiofiles
from pathlib import Path
from app.core.config import settings


async def save_upload(file_content: bytes, filename: str, user_id: str) -> str:
    user_dir = Path(settings.UPLOAD_DIR) / user_id
    user_dir.mkdir(parents=True, exist_ok=True)

    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = user_dir / unique_name

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)

    return str(file_path)


async def delete_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
