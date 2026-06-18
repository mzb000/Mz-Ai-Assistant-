"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import * as chatApi from "@/lib/api/chat";
import * as documentApi from "@/lib/api/documents";
import { useDocumentStore } from "@/store/document-store";
import type { Message } from "@/types/chat";

export function useChat() {
  const store = useChatStore();
  const token = useAuthStore((s) => s.token);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const convs = await chatApi.getConversations(token, store.searchQuery || undefined);
      store.setConversations(convs);
    } catch {
      // Network error or auth expired — leave conversations as-is
    }
  }, [token, store]);

  const loadConversation = useCallback(
    async (id: string) => {
      if (!token) return;
      const conv = await chatApi.getConversation(token, id);
      store.setCurrentConversation(id);
      store.setMessages(conv.messages || []);
      store.setProvider(conv.provider);
      store.setModel(conv.model);
    },
    [token, store],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!token || !message.trim() || store.isStreaming) return;

      store.setIsStreaming(true);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      store.addMessage(userMsg);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };
      store.addMessage(assistantMsg);

      abortRef.current = chatApi.streamChat(
        token,
        message,
        store.provider,
        store.model,
        store.currentConversationId ?? undefined,
        store.selectedDocumentIds.length > 0 ? store.selectedDocumentIds : undefined,
        store.systemPrompt || undefined,
        (chunk) => store.updateLastAssistantMessage(chunk),
        async (convId) => {
          store.setIsStreaming(false);
          store.setCurrentConversation(convId);
          await loadConversations();
        },
        () => store.setIsStreaming(false),
      );
    },
    [token, store, loadConversations],
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!token || store.isStreaming || store.messages.length < 2) return;

    const msgs = [...store.messages];
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Remove the last assistant message
    if (msgs[msgs.length - 1]?.role === "assistant") {
      store.removeLastMessage();
    }

    store.setIsStreaming(true);

    const assistantMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    store.addMessage(assistantMsg);

    abortRef.current = chatApi.streamChat(
      token,
      lastUserMsg.content,
      store.provider,
      store.model,
      store.currentConversationId ?? undefined,
      store.selectedDocumentIds.length > 0 ? store.selectedDocumentIds : undefined,
      store.systemPrompt || undefined,
      (chunk) => store.updateLastAssistantMessage(chunk),
      async (convId) => {
        store.setIsStreaming(false);
        store.setCurrentConversation(convId);
        await loadConversations();
      },
      () => store.setIsStreaming(false),
    );
  }, [token, store, loadConversations]);

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await chatApi.deleteConversation(token, id);
        store.removeConversation(id);
        if (store.currentConversationId === id) {
          store.reset();
        }
      } catch {
        // Silently handle network errors
      }
    },
    [token, store],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      if (!token) return;
      try {
        await chatApi.renameConversation(token, id, title);
        store.updateConversationTitle(id, title);
      } catch {
        // Silently handle network errors
      }
    },
    [token, store],
  );

  const clearAllConversations = useCallback(async () => {
    if (!token) return;
    try {
      await chatApi.clearAllConversations(token);
      store.clearAll();
    } catch {
      // Silently handle network errors
    }
  }, [token, store]);

  const exportConversation = useCallback(
    async (id: string) => {
      if (!token) return;
      const data = await chatApi.exportConversation(token, id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversation-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [token],
  );

  const loadDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const docs = await documentApi.getDocuments(token);
      useDocumentStore.getState().setDocuments(docs);
    } catch {
      // Network error or auth expired — leave documents as-is
    }
  }, [token]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    store.setIsStreaming(false);
  }, [store]);

  const newChat = useCallback(() => {
    store.reset();
  }, [store]);

  return {
    ...store,
    loadConversations,
    loadConversation,
    sendMessage,
    regenerateLastResponse,
    deleteConversation,
    renameConversation,
    clearAllConversations,
    exportConversation,
    loadDocuments,
    cancelStream,
    newChat,
  };
}
