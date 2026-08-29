"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconPlus,
} from "@/components/icons/VedaIcons";
import { MappedAnswer } from "@/lib/types";
import { getHighlightBoundingBox } from "@/lib/bounding-box";
import AnswerHighlight from "./AnswerHighlight";
import PdfSheetCanvas from "./PdfSheetCanvas";

interface AnswerSheetViewerProps {
  imageSrc: string;
  mimeType: string;
  answers: MappedAnswer[];
  selectedId: string | null;
  isRefining?: boolean;
}

export default function AnswerSheetViewer({
  imageSrc,
  mimeType,
  answers,
  selectedId,
  isRefining = false,
}: AnswerSheetViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [pdfPages, setPdfPages] = useState(1);
  const [sheetReady, setSheetReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const isPdf = mimeType === "application/pdf";

  const selectedAnswer = useMemo(
    () => answers.find((item) => item.questionId === selectedId) ?? null,
    [answers, selectedId]
  );

  const highlight = useMemo(() => {
    const result = getHighlightBoundingBox(answers, selectedId, {
      allowEstimate: true,
    });

    if (result && !result.estimated) return result;
    if (isRefining) return null;
    return result;
  }, [answers, selectedId, isRefining]);

  const activePage = isPdf
    ? (highlight?.answer.pageNumber ?? selectedAnswer?.pageNumber ?? page)
    : 1;

  const showHighlightOnPage =
    !isPdf || !highlight || (highlight.answer.pageNumber ?? 1) === activePage;

  const scrollToHighlight = useCallback(() => {
    if (!scrollRef.current || !highlightRef.current) return;

    const container = scrollRef.current;
    const target = highlightRef.current;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    container.scrollTo({
      top:
        container.scrollTop +
        (targetRect.top - containerRect.top) -
        container.clientHeight / 2 +
        targetRect.height / 2,
      left:
        container.scrollLeft +
        (targetRect.left - containerRect.left) -
        container.clientWidth / 2 +
        targetRect.width / 2,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (isPdf && selectedAnswer?.pageNumber) {
      setPage(selectedAnswer.pageNumber);
    }
  }, [isPdf, selectedAnswer?.pageNumber, selectedId]);

  useEffect(() => {
    setSheetReady(false);
  }, [imageSrc, isPdf, activePage]);

  useEffect(() => {
    if (!highlight || !sheetReady || isRefining || !showHighlightOnPage) return;
    const timer = window.setTimeout(scrollToHighlight, 120);
    return () => window.clearTimeout(timer);
  }, [
    highlight,
    sheetReady,
    isRefining,
    zoom,
    showHighlightOnPage,
    scrollToHighlight,
  ]);

  const handleZoomIn = () => setZoom((value) => Math.min(value + 25, 200));
  const handleZoomOut = () => setZoom((value) => Math.max(value - 25, 50));

  const label =
    highlight?.answer.questionNumber.replace(/\(.*\)/, "") ?? "";

  const totalPages = isPdf ? pdfPages : 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-veda-text px-6 py-3">
        <h2 className="text-base font-bold tracking-[-0.04em] text-white/80">
          Answer Sheet
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="text-white transition-colors hover:text-white/80"
              aria-label="Zoom out"
            >
              <IconMinus size={16} className="text-white" />
            </button>
            <span className="w-10 text-center text-sm font-bold tracking-[-0.04em] text-white">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="text-white transition-colors hover:text-white/80"
              aria-label="Zoom in"
            >
              <IconPlus size={16} className="text-white" />
            </button>
          </div>

          {isPdf && totalPages > 1 && (
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={activePage === 1}
                className="text-white/60 disabled:opacity-40"
                aria-label="Previous page"
              >
                <IconChevronLeft size={16} className="text-white/60" />
              </button>
              <span className="text-sm font-bold tracking-[-0.04em] text-white">
                Page {activePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={activePage === totalPages}
                className="text-white disabled:opacity-40"
                aria-label="Next page"
              >
                <IconChevronRight size={16} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto bg-[#f8f8f8] scroll-smooth"
      >
        <div
          className="mx-auto p-4 transition-[width] duration-200"
          style={{ width: `${zoom}%` }}
        >
          <div className="relative">
            {isPdf ? (
              <PdfSheetCanvas
                src={imageSrc}
                page={activePage}
                onDocumentLoad={setPdfPages}
                onRender={() => setSheetReady(true)}
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Answer Sheet"
                  className="block w-full select-none"
                  onLoad={() => setSheetReady(true)}
                />
              </>
            )}

            {highlight && showHighlightOnPage && (
              <div
                ref={highlightRef}
                className="absolute z-20"
                style={{
                  left: `${highlight.box.x}%`,
                  top: `${highlight.box.y}%`,
                  width: `${highlight.box.width}%`,
                  height: `${highlight.box.height}%`,
                }}
              >
                <AnswerHighlight label={label} />
              </div>
            )}
          </div>
        </div>

        {isRefining && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="rounded-full bg-veda-text/90 px-4 py-1.5 text-xs font-medium text-white">
              Locating answer...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
