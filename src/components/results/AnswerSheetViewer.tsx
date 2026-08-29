"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconPlus,
} from "@/components/icons/VedaIcons";
import { MappedAnswer } from "@/lib/types";

interface AnswerSheetViewerProps {
  imageSrc: string;
  mimeType: string;
  answers: MappedAnswer[];
  selectedId: string | null;
}

export default function AnswerSheetViewer({
  imageSrc,
  mimeType,
  answers,
  selectedId,
}: AnswerSheetViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isPdf = mimeType === "application/pdf";

  const totalPages = useMemo(() => {
    const maxPage = answers.reduce(
      (max, answer) => Math.max(max, answer.pageNumber ?? 1),
      1
    );
    return Math.max(maxPage, 1);
  }, [answers]);

  const pageAnswers = useMemo(
    () => answers.filter((answer) => (answer.pageNumber ?? 1) === page),
    [answers, page]
  );

  const scrollToHighlight = useCallback(
    (questionId: string | null) => {
      if (!questionId || !scrollRef.current) return;

      const highlight = highlightRefs.current.get(questionId);
      if (!highlight) return;

      const container = scrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const highlightRect = highlight.getBoundingClientRect();

      const deltaY =
        highlightRect.top -
        containerRect.top -
        container.clientHeight / 2 +
        highlightRect.height / 2 +
        14;
      const deltaX =
        highlightRect.left -
        containerRect.left -
        container.clientWidth / 2 +
        highlightRect.width / 2;

      container.scrollTo({
        top: container.scrollTop + deltaY,
        left: container.scrollLeft + deltaX,
        behavior: "smooth",
      });
    },
    []
  );

  useEffect(() => {
    if (!selectedId) return;

    const answer = answers.find((item) => item.questionId === selectedId);
    if (answer?.pageNumber && answer.pageNumber !== page) {
      setPage(answer.pageNumber);
      return;
    }

    if (imageLoaded) {
      const timer = window.setTimeout(() => scrollToHighlight(selectedId), 80);
      return () => window.clearTimeout(timer);
    }
  }, [selectedId, answers, page, imageLoaded, scrollToHighlight]);

  useEffect(() => {
    if (imageLoaded && selectedId) {
      const timer = window.setTimeout(() => scrollToHighlight(selectedId), 120);
      return () => window.clearTimeout(timer);
    }
  }, [page, imageLoaded, selectedId, scrollToHighlight]);

  const handleZoomIn = () => setZoom((value) => Math.min(value + 25, 200));
  const handleZoomOut = () => setZoom((value) => Math.max(value - 25, 50));

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

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="text-white/60 disabled:opacity-40"
              aria-label="Previous page"
            >
              <IconChevronLeft size={16} className="text-white/60" />
            </button>
            <span className="text-sm font-bold tracking-[-0.04em] text-white">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              className="text-white disabled:opacity-40"
              aria-label="Next page"
            >
              <IconChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto bg-[#f8f8f8] scroll-smooth"
      >
        <div
          className="mx-auto p-4 pt-8 transition-[width] duration-200"
          style={{ width: `${zoom}%` }}
        >
          {isPdf ? (
            <iframe
              src={imageSrc}
              className="h-[700px] w-full bg-white"
              title="Answer Sheet PDF"
            />
          ) : (
            <div ref={imageWrapRef} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Answer Sheet"
                className="block w-full select-none"
                onLoad={() => setImageLoaded(true)}
              />

              {pageAnswers.map((answer) => {
                if (!answer.boundingBox || answer.questionId !== selectedId) {
                  return null;
                }

                const { x, y, width, height } = answer.boundingBox;
                const label = answer.questionNumber.replace(/\(.*\)/, "");

                return (
                  <div
                    key={answer.questionId}
                    ref={(node) => {
                      if (node) {
                        highlightRefs.current.set(answer.questionId, node);
                      } else {
                        highlightRefs.current.delete(answer.questionId);
                      }
                    }}
                    data-question-id={answer.questionId}
                    className="pointer-events-none absolute z-20 rounded-2xl border-2 border-[#3DD218] bg-[rgba(94,255,53,0.1)]"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      boxShadow: "0 0 0 1px rgba(61, 210, 24, 0.2)",
                    }}
                  >
                    <span className="absolute left-3.5 -top-[27px] rounded-t-xl bg-[#3DD218] px-3 py-1 text-base font-bold tracking-[-0.04em] text-white underline decoration-white underline-offset-[3px]">
                      Q{label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
