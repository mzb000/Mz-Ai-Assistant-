"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils/cn";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  uploading?: boolean;
  className?: string;
}

export default function UploadZone({ onUpload, uploading, className }: UploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onUpload(accepted);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt", ".md", ".csv", ".json"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive && !isDragReject && "border-neon-500 bg-neon-500/5 neon-glow",
        isDragReject && "border-red-500 bg-red-500/5",
        !isDragActive && "border-border hover:border-neon-500/50 hover:bg-surface2/30",
        uploading && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-500/10 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-neon-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-muted">Uploading...</p>
        </div>
      ) : isDragReject ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-sm text-red-400">File type not supported</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-500/10 flex items-center justify-center">
            {isDragActive ? (
              <Upload size={24} className="text-neon-400" />
            ) : (
              <FileText size={24} className="text-neon-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted mt-1">PDF, DOCX, TXT, MD, CSV, PNG, JPG (max 50MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
