"use client";

import { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useDocumentStore } from "@/store/document-store";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";

export default function ChatPage() {
  const { loadConversations, loadDocuments } = useChat();
  const { documents } = useDocumentStore();

  useEffect(() => {
    loadConversations();
    loadDocuments();
  }, [loadConversations, loadDocuments]);

  return (
    <div className="h-full flex flex-col">
      <MessageList />
      <ChatInput />
    </div>
  );
}
