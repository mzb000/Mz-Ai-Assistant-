import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import OpenAI
from app.core.config import settings


_client = None
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)


def get_openai_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY or None)
    return _client


def get_or_create_collection(collection_name: str):
    try:
        return chroma_client.get_collection(collection_name)
    except ValueError:
        return chroma_client.create_collection(collection_name)


def embed_text(text: str) -> list:
    response = get_openai_client().embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


def index_document(document_id: str, text: str, metadata: dict = None):
    collection = get_or_create_collection("documents")
    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks):
        embedding = embed_text(chunk)
        collection.add(
            ids=[f"{document_id}_{i}"],
            embeddings=[embedding],
            documents=[chunk],
            metadatas=[{"document_id": document_id, "chunk_index": i, **(metadata or {})}],
        )


def search_documents(query: str, document_ids: list[str] = None, n_results: int = 5) -> list[dict]:
    collection = get_or_create_collection("documents")
    query_embedding = embed_text(query)
    where_filter = {"document_id": {"$in": document_ids}} if document_ids else None
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where_filter,
    )
    documents = []
    for i in range(len(results["ids"][0])):
        documents.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i] if results["distances"] else 0,
        })
    return documents


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks
