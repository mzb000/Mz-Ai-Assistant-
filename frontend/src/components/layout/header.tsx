"use client";

import { useUIStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Menu, PanelLeftClose, PanelLeft, Cpu } from "lucide-react";
import { AI_PROVIDERS } from "@/types/ai-provider";
import { cn } from "@/lib/utils/cn";

export default function Header() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { provider, model } = useChatStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);

  return (
    <header className="h-14 glass border-b border-border flex items-center px-4 gap-3">
      <button
        onClick={toggleSidebar}
        className="text-muted hover:text-foreground transition-colors"
      >
        {isMobile ? (
          <Menu size={20} />
        ) : sidebarOpen ? (
          <PanelLeftClose size={20} />
        ) : (
          <PanelLeft size={20} />
        )}
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Cpu size={14} className={cn("shrink-0", currentProvider?.color || "text-muted")} />
        <span className="text-xs text-muted hidden sm:inline">{currentProvider?.name}</span>
        <span className="text-xs font-mono text-neon-400/70 bg-surface2/50 px-2 py-0.5 rounded-md">
          {model}
        </span>
      </div>
    </header>
  );
}
