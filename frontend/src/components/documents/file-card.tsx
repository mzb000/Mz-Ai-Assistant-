"use client";

import { cn } from "@/lib/utils/cn";
import { FileText, Trash2, Check, File, Image } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import type { Document } from "@/types/document";

interface FileCardProps {
  document: Document;
  selected?: boolean;
  onDelete?: () => void;
  onToggleSelect?: () => void;
  className?: string;
}

function getFileIcon(type: string) {
  if (["png", "jpg", "jpeg"].includes(type)) return Image;
  return File;
}

export default function FileCard({ document, selected, onDelete, onToggleSelect, className }: FileCardProps) {
  const Icon = getFileIcon(document.file_type);

  return (
    <div
      onClick={onToggleSelect}
      className={cn(
        "glass rounded-xl p-3 flex items-center gap-3 transition-all duration-200 cursor-pointer group",
        selected && "neon-border bg-neon-500/5",
        "glass-hover",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
          selected ? "bg-neon-500/20 text-neon-400" : "bg-surface2 text-muted",
        )}
      >
        {selected ? <Check size={18} /> : <Icon size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate font-medium">{document.filename}</p>
        <p className="text-xs text-muted">{formatFileSize(document.file_size)}</p>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
