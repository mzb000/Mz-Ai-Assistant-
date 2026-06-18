import type { Conversation, ConversationListItem } from "@/types/chat";

const API_BASE = "/api";

export async function getConversations(token: string, search?: string): Promise<ConversationListItem[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/chat/conversations${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function getConversation(token: string, id: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function deleteConversation(token: string, id: string): Promise<void> {
  await fetch(`${API_BASE}/chat/conversations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function renameConversation(token: string, id: string, title: string): Promise<void> {
  await fetch(`${API_BASE}/chat/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });
}

export async function clearAllConversations(token: string): Promise<void> {
  await fetch(`${API_BASE}/chat/conversations`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function exportConversation(token: string, id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to export");
  return res.json();
}

export function streamChat(
  token: string,
  message: string,
  provider: string,
  model: string,
  conversationId?: string,
  documentIds?: string[],
  systemPrompt?: string,
  onChunk?: (text: string, convId: string) => void,
  onDone?: (convId: string) => void,
  onError?: (err: Error) => void,
): AbortController {
  const controller = new AbortController();

  fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      provider,
      model,
      document_ids: documentIds,
      system_prompt: systemPrompt || undefined,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                onDone?.(data.conversation_id);
              } else if (data.content) {
                onChunk?.(data.content, data.conversation_id);
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError?.(err);
    });

  return controller;
}
