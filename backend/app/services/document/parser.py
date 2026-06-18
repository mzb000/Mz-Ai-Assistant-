import os
import traceback
from typing import Optional
import pdfplumber
import docx
import markdown
from bs4 import BeautifulSoup
from PIL import Image


def parse_file(file_path: str) -> Optional[str]:
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            return parse_pdf(file_path)
        elif ext == ".docx":
            return parse_docx(file_path)
        elif ext == ".txt":
            return parse_txt(file_path)
        elif ext == ".md":
            return parse_md(file_path)
        elif ext in (".png", ".jpg", ".jpeg"):
            return parse_image(file_path)
        elif ext == ".csv":
            return parse_txt(file_path)
        elif ext == ".json":
            return parse_txt(file_path)
    except Exception as e:
        return f"[File: {os.path.basename(file_path)} — could not extract text: {str(e)}]"

    return None


def parse_pdf(file_path: str) -> str:
    text = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text.append(page_text)
    except Exception:
        text.append(f"[PDF file: {os.path.basename(file_path)} — text extraction failed]")

    if not text or all(not t.strip() for t in text):
        return f"[PDF file: {os.path.basename(file_path)} — no extractable text]"
    return "\n".join(text)


def parse_docx(file_path: str) -> str:
    try:
        doc = docx.Document(file_path)
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        if not text.strip():
            return f"[DOCX file: {os.path.basename(file_path)} — no extractable text]"
        return text
    except Exception as e:
        return f"[DOCX file: {os.path.basename(file_path)} — {str(e)}]"


def parse_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    if not content.strip():
        return f"[File: {os.path.basename(file_path)} — empty]"
    return content


def parse_md(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        html = markdown.markdown(f.read())
    text = BeautifulSoup(html, "html.parser").get_text()
    if not text.strip():
        return f"[File: {os.path.basename(file_path)} — empty]"
    return text


def parse_image(file_path: str) -> str:
    try:
        img = Image.open(file_path)
        width, height = img.size
        fmt = img.format or "unknown"
        return f"[Image: {os.path.basename(file_path)} ({fmt}, {width}x{height})]"
    except Exception:
        return f"[Image file: {os.path.basename(file_path)}]"
