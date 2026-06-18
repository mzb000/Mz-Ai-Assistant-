"use client";

import { useState } from "react";
import { X, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Modal from "@/components/ui/modal";
import type { Document } from "@/types/document";

interface DocumentViewerProps {
  document: Document | null;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!document) return null;

  return (
    <Modal open={!!document} onClose={onClose} title={document.filename} className="max-w-3xl max-h-[80vh]">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in document..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:border-neon-500/50"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh]">
        <div className="flex items-center justify-center py-12 text-muted">
          <div className="text-center">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Document content preview</p>
            <p className="text-xs text-muted/60 mt-1">Use search to find specific content</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
