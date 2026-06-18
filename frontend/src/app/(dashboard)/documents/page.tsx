"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDocumentStore } from "@/store/document-store";
import { useChat } from "@/hooks/use-chat";
import * as documentApi from "@/lib/api/documents";
import UploadZone from "@/components/documents/upload-zone";
import DocumentList from "@/components/documents/document-list";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  const token = useAuthStore((s) => s.token);
  const { uploading, setUploading, addDocument, removeDocument } = useDocumentStore();
  const { loadDocuments, selectedDocumentIds, toggleDocumentId } = useChat();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDocuments().finally(() => setLoading(false));
    }
  }, [token, loadDocuments]);

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (!token) return;
      setUploading(true);
      try {
        for (const file of files) {
          const doc = await documentApi.uploadDocument(token, file);
          addDocument(doc);
          toast.success(`${file.name} uploaded`);
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [token, setUploading, addDocument],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await documentApi.deleteDocument(token, id);
        removeDocument(id);
        toast.success("Document deleted");
      } catch {
        toast.error("Delete failed");
      }
    },
    [token, removeDocument],
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neon-500/10 flex items-center justify-center">
            <FileText size={20} className="text-neon-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted">Upload documents for Zabi to reference</p>
          </div>
        </div>

        <UploadZone onUpload={handleUpload} uploading={uploading} className="mb-8" />

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-neon-500/30 border-t-neon-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <DocumentList />
        )}
      </div>
    </div>
  );
}
