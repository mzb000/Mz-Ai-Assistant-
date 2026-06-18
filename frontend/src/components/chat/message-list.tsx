"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import ChatBubble from "./chat-bubble";
import { Bot, Sparkles, Code, BookOpen, MessageSquare } from "lucide-react";

export default function MessageList() {
  const { messages, isStreaming, regenerateLastResponse } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-500/20 to-purple-600/20 border border-neon-500/20 flex items-center justify-center">
            <Bot size={32} className="text-neon-400" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-2">Zabi AI Assistant</h1>
          <p className="text-muted mb-8">Ask me anything, upload documents, or use voice input</p>

          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.label} {...suggestion} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
            isLast={i === messages.length - 1}
            onRegenerate={regenerateLastResponse}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const suggestions = [
  { icon: Sparkles, label: "Explain", text: "Explain quantum computing in simple terms", color: "text-yellow-400" },
  { icon: Code, label: "Code", text: "Write a Python function to sort a list using merge sort", color: "text-green-400" },
  { icon: BookOpen, label: "Analyze", text: "What are the pros and cons of microservices architecture?", color: "text-blue-400" },
  { icon: MessageSquare, label: "Creative", text: "Write a short story about an AI that discovers emotions", color: "text-purple-400" },
];

function SuggestionCard({
  icon: Icon,
  label,
  text,
  color,
}: {
  icon: typeof Sparkles;
  label: string;
  text: string;
  color: string;
}) {
  const { sendMessage } = useChat();

  return (
    <button
      onClick={() => sendMessage(text)}
      className="glass glass-hover rounded-xl p-4 text-left group"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted line-clamp-2 group-hover:text-foreground/70 transition-colors">{text}</p>
    </button>
  );
}
