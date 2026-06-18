import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, ConversationListItem } from "@/types/chat";

interface ChatState {
  conversations: ConversationListItem[];
  currentConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  provider: string;
  model: string;
  selectedDocumentIds: string[];
  systemPrompt: string;
  searchQuery: string;

  setConversations: (convs: ConversationListItem[]) => void;
  setCurrentConversation: (id: string | null) => void;
  addConversation: (conv: ConversationListItem) => void;
  removeConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  removeLastMessage: () => void;
  setIsStreaming: (val: boolean) => void;
  setProvider: (p: string) => void;
  setModel: (m: string) => void;
  setSelectedDocumentIds: (ids: string[]) => void;
  toggleDocumentId: (id: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
  clearAll: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      isStreaming: false,
      provider: "openai",
      model: "gpt-4o",
      selectedDocumentIds: [],
      systemPrompt: "",
      searchQuery: "",

      setConversations: (convs) => set({ conversations: convs }),
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      addConversation: (conv) =>
        set((s) => ({ conversations: [conv, ...s.conversations] })),
      removeConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          currentConversationId: s.currentConversationId === id ? null : s.currentConversationId,
        })),
      updateConversationTitle: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateLastAssistantMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          if (last && last.role === "assistant") {
            msgs[msgs.length - 1] = { ...last, content: last.content + content };
          }
          return { messages: msgs };
        }),
      removeLastMessage: () =>
        set((s) => ({ messages: s.messages.slice(0, -1) })),
      setIsStreaming: (val) => set({ isStreaming: val }),
      setProvider: (p) => set({ provider: p }),
      setModel: (m) => set({ model: m }),
      setSelectedDocumentIds: (ids) => set({ selectedDocumentIds: ids }),
      toggleDocumentId: (id) =>
        set((s) => ({
          selectedDocumentIds: s.selectedDocumentIds.includes(id)
            ? s.selectedDocumentIds.filter((d) => d !== id)
            : [...s.selectedDocumentIds, id],
        })),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      reset: () =>
        set({
          currentConversationId: null,
          messages: [],
          isStreaming: false,
          selectedDocumentIds: [],
        }),
      clearAll: () =>
        set({
          conversations: [],
          currentConversationId: null,
          messages: [],
          isStreaming: false,
          selectedDocumentIds: [],
        }),
    }),
    {
      name: "zabi-chat-settings",
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        systemPrompt: state.systemPrompt,
      }),
    },
  ),
);
