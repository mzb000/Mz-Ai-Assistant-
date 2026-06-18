"use client";

import { cn } from "@/lib/utils/cn";
import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";

interface MicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function MicButton({ onTranscript, className }: MicButtonProps) {
  const { isListening, transcript, startListening, stopListening } = useVoice();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) onTranscript(transcript);
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300",
        isListening
          ? "bg-red-500/20 text-red-400 neon-glow scale-110"
          : "bg-surface2 text-muted hover:text-foreground hover:bg-border",
        className,
      )}
    >
      {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}
