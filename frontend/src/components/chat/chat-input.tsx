"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Mic, Square, Paperclip, ImageIcon, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChat } from "@/hooks/use-chat";
import { useVoice } from "@/hooks/use-voice";
import { useAuthStore } from "@/store/auth-store";
import { uploadDocument } from "@/lib/api/documents";
import { useDocumentStore } from "@/store/document-store";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const { sendMessage, isStreaming, cancelStream, toggleDocumentId } = useChat();
  const { isListening, transcript, startListening, stopListening } = useVoice();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((s) => s.token);
  const { addDocument } = useDocumentStore();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isStreaming) return;

    if (attachedFiles.length > 0 && token) {
      for (const file of attachedFiles) {
        try {
          const doc = await uploadDocument(token, file);
          addDocument(doc);
          toggleDocumentId(doc.id);
        } catch (err) {
          console.error("Upload failed:", err);
        }
      }
      setAttachedFiles([]);
    }

    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        sendMessage(transcript);
        setInput("");
      }
    } else {
      startListening();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-xl p-4">
      <div className="max-w-4xl mx-auto">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface2 border border-border text-xs"
              >
                {file.type.startsWith("image/") ? (
                  <ImageIcon size={14} className="text-neon-400" />
                ) : (
                  <FileText size={14} className="text-neon-400" />
                )}
                <span className="text-foreground max-w-[120px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-muted hover:text-red-400 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 glass rounded-2xl p-2 neon-border">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg"
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Message Zabi..."}
            rows={1}
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder:text-muted/40 resize-none outline-none max-h-[200px] py-2 px-2",
              "scrollbar-thin",
            )}
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleVoiceToggle}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse-neon"
                  : "text-muted hover:text-foreground hover:bg-surface2/50",
              )}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              <Mic size={18} />
            </button>

            {isStreaming ? (
              <button
                onClick={cancelStream}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                title="Stop generating"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && attachedFiles.length === 0}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-neon-500 text-black hover:bg-neon-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted/40 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
