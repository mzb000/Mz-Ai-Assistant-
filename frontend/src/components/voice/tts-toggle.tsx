"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { speakText, stopSpeaking } from "@/lib/voice/speech-synthesis";

interface TTSToggleProps {
  text: string;
  className?: string;
}

export default function TTSToggle({ text, className }: TTSToggleProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleToggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(text, () => setSpeaking(false));
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "text-muted hover:text-foreground transition-colors",
        speaking && "text-neon-400",
        className,
      )}
      title={speaking ? "Stop" : "Read aloud"}
    >
      {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
