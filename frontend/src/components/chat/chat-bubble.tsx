"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check, RefreshCw } from "lucide-react";
import type { Message } from "@/types/chat";

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export default function ChatBubble({ message, isStreaming, isLast, onRegenerate }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 group animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
          isUser
            ? "bg-neon-500/20 text-neon-400"
            : "bg-gradient-to-br from-neon-500 to-purple-600 text-white",
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="flex flex-col max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-neon-500/10 border border-neon-500/20"
              : "glass",
          )}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return (
                    <code
                      className={cn(
                        "bg-surface2 rounded px-1.5 py-0.5 text-sm font-mono",
                        match && "block p-4 overflow-x-auto",
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <pre className="bg-surface2 rounded-xl p-4 overflow-x-auto">{children}</pre>;
                },
                a({ href, children }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content || (isStreaming ? "" : "")}
            </ReactMarkdown>
            {isStreaming && !message.content && (
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-neon-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neon-400 rounded-full animate-bounce animate-delay-100" />
                <span className="w-2 h-2 bg-neon-400 rounded-full animate-bounce animate-delay-200" />
              </span>
            )}
          </div>
        </div>

        {message.content && !isStreaming && (
          <div className={cn(
            "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "justify-end" : "justify-start",
          )}>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            {!isUser && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
