"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconClose, IconUpload } from "@/components/icons/VedaIcons";
import {
  validateFile,
  formatFileSizeCompact,
  getFilePageCount,
} from "@/lib/validation";

interface UploadCardProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
}

function PdfFileIcon() {
  return (
    <div className="w-[35px] h-10 shrink-0 rounded-[4px] bg-[#E5252A] flex items-center justify-center">
      <span className="text-[10px] font-bold leading-none tracking-[-0.02em] text-white">
        PDF
      </span>
    </div>
  );
}

function ImageFileIcon() {
  return (
    <div className="w-[35px] h-10 shrink-0 rounded-[4px] bg-[#3B82F6] flex items-center justify-center">
      <span className="text-[9px] font-bold leading-none tracking-[-0.02em] text-white">
        IMG
      </span>
    </div>
  );
}

export default function UploadCard({
  label,
  file,
  onFileSelect,
  error,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    if (!file) {
      setPageCount(null);
      return;
    }

    let cancelled = false;
    getFilePageCount(file).then((count) => {
      if (!cancelled) setPageCount(count);
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleFile = useCallback(
    (selected: File | null) => {
      setLocalError(null);
      if (!selected) {
        onFileSelect(null);
        return;
      }
      const validationError = validateFile(selected);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      onFileSelect(selected);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPdf =
    file?.type === "application/pdf" ||
    file?.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex-1 min-w-0">
      <div
        className={`upload-dashed rounded-[20px] bg-white flex items-center justify-center min-h-[181px] relative ${
          file ? "cursor-default" : "cursor-pointer"
        } ${dragOver && !file ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!file) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        {file ? (
          <div className="w-full px-6 py-5 flex items-center justify-center">
            <div className="relative w-full max-w-[300px]">
              <div className="flex items-center gap-3 bg-veda-bg-off-white rounded-xl px-4 py-3.5 pr-10">
                {isPdf ? <PdfFileIcon /> : <ImageFileIcon />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base leading-tight tracking-[-0.04em] text-veda-dark truncate">
                    {file.name}
                  </p>
                  <p className="mt-1 text-sm leading-tight tracking-[-0.04em] text-veda-text-muted">
                    {formatFileSizeCompact(file.size)}
                    {pageCount !== null && (
                      <>
                        <span className="mx-1.5">•</span>
                        {pageCount} Page{pageCount === 1 ? "" : "s"}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                aria-label={`Remove ${label}`}
                className="absolute -top-2.5 -right-2.5 w-[26px] h-[26px] flex items-center justify-center bg-[rgba(43,43,43,0.85)] rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.18)] hover:bg-[rgba(43,43,43,0.95)] transition-colors"
              >
                <IconClose size={14} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-12 h-12 flex items-center justify-center bg-veda-bg-off-white rounded-lg">
              <IconUpload size={32} className="text-veda-text" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold tracking-[-0.06em]">
                <span className="text-veda-dark">Upload </span>
                <span className="text-veda-orange">{label}</span>
              </p>
              <p className="text-sm tracking-[-0.06em] text-veda-text-muted-light mt-0.5">
                Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {(error || localError) && (
        <p className="text-xs text-veda-danger mt-2 text-center">
          {error || localError}
        </p>
      )}
    </div>
  );
}
