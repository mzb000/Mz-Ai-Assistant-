from app.services.document.embedding import search_documents


def retrieve_context(query: str, document_ids: list[str], n_results: int = 5) -> str:
    results = search_documents(query, document_ids, n_results)
    if not results:
        return ""
    context_parts = []
    for r in results:
        context_parts.append(f"[From document {r['metadata'].get('filename', 'unknown')}]:\n{r['text']}")
    return "\n\n".join(context_parts)
