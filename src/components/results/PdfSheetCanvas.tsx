"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";

interface PdfSheetCanvasProps {
  src: string;
  page: number;
  onDocumentLoad?: (totalPages: number) => void;
  onRender?: () => void;
}

export default function PdfSheetCanvas({
  src,
  page,
  onDocumentLoad,
  onRender,
}: PdfSheetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onDocumentLoadRef = useRef(onDocumentLoad);
  const onRenderRef = useRef(onRender);

  onDocumentLoadRef.current = onDocumentLoad;
  onRenderRef.current = onRender;

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    async function renderPage() {
      try {
        setError(null);
        const pdf = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return;

        onDocumentLoadRef.current?.(pdf.numPages);

        const pageIndex = Math.min(Math.max(page, 1), pdf.numPages);
        const pdfPage = await pdf.getPage(pageIndex);
        if (cancelled || !canvas) return;

        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        await pdfPage.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise;

        if (!cancelled) onRenderRef.current?.();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render PDF page."
          );
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [src, page]);

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white p-6 text-sm text-veda-text-muted">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
