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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const onDocumentLoadRef = useRef(onDocumentLoad);
  const onRenderRef = useRef(onRender);

  onDocumentLoadRef.current = onDocumentLoad;
  onRenderRef.current = onRender;

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || containerWidth <= 0) return;

    async function renderPage() {
      try {
        setError(null);
        const pdf = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return;

        onDocumentLoadRef.current?.(pdf.numPages);

        const pageIndex = Math.min(Math.max(page, 1), pdf.numPages);
        const pdfPage = await pdf.getPage(pageIndex);
        if (cancelled || !canvas) return;

        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const scale = (containerWidth / baseViewport.width) * pixelRatio;
        const viewport = pdfPage.getViewport({ scale });
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
  }, [src, page, containerWidth]);

  if (error) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl bg-white p-4 text-sm text-veda-text-muted sm:min-h-[200px] sm:p-6">
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full bg-white">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
