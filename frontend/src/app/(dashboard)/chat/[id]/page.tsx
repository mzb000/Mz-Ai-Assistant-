"use client";

import { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { loadConversation, loadConversations } = useChat();

  useEffect(() => {
    loadConversations();
    loadConversation(id);
  }, [id, loadConversation, loadConversations]);

  return (
    <div className="h-full flex flex-col">
      <MessageList />
      <ChatInput />
    </div>
  );
}
