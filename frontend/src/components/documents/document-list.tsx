"use client";

import { useChat } from "@/hooks/use-chat";
import { useDocumentStore } from "@/store/document-store";
import FileCard from "./file-card";

export default function DocumentList() {
  const { documents, removeDocument } = useDocumentStore();
  const { selectedDocumentIds, toggleDocumentId } = useChat();

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted uppercase tracking-wider font-medium mb-3">
        Uploaded Documents ({documents.length})
      </p>
      {documents.map((doc) => (
        <FileCard
          key={doc.id}
          document={doc}
          selected={selectedDocumentIds.includes(doc.id)}
          onToggleSelect={() => toggleDocumentId(doc.id)}
          onDelete={() => removeDocument(doc.id)}
        />
      ))}
    </div>
  );
}
