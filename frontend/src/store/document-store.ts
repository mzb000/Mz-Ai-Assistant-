import { create } from "zustand";
import type { Document } from "@/types/document";

interface DocumentState {
  documents: Document[];
  uploading: boolean;
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  setUploading: (val: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  uploading: false,
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  removeDocument: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
  setUploading: (val) => set({ uploading: val }),
}));
