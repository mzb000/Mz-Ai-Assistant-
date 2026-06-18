"use client";

import { cn } from "@/lib/utils/cn";

interface VoiceWaveProps {
  active?: boolean;
  className?: string;
}

export default function VoiceWave({ active, className }: VoiceWaveProps) {
  return (
    <div className={cn("flex items-center gap-0.5 h-6", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-neon-400 transition-all duration-300",
            active
              ? "animate-voice-wave"
              : "h-1 opacity-30",
          )}
          style={active ? { animationDelay: `${i * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}
