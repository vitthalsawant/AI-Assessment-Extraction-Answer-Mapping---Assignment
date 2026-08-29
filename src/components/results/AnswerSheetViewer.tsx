"use client";

import { useState, useRef, useEffect } from "react";
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
  const totalPages = 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const isPdf = mimeType === "application/pdf";

  const selectedAnswer = answers.find((a) => a.questionId === selectedId);

  useEffect(() => {
    if (selectedId && containerRef.current) {
      const box = containerRef.current.querySelector(
        `[data-question-id="${selectedId}"]`
      );
      box?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedId]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  return (
    <div className="flex flex-col h-full bg-white border border-black/10 rounded-[20px] overflow-hidden">
      {/* Dark header */}
      <div className="flex items-center justify-between px-6 py-3 bg-veda-text border-b border-black/10 shrink-0">
        <h2 className="text-base font-bold tracking-[-0.04em] text-white/80">
          Answer Sheet
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <button
              onClick={handleZoomOut}
              className="text-white hover:text-white/80 transition-colors"
            >
              <IconMinus size={16} className="text-white" />
            </button>
            <span className="text-sm font-bold tracking-[-0.04em] text-white w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="text-white hover:text-white/80 transition-colors"
            >
              <IconPlus size={16} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-white/60 disabled:opacity-40"
            >
              <IconChevronLeft size={16} className="text-white/60" />
            </button>
            <span className="text-sm font-bold tracking-[-0.04em] text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-white"
            >
              <IconChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet content */}
      <div className="flex-1 overflow-auto bg-[#f8f8f8]" ref={containerRef}>
        <div
          className="relative mx-auto transition-transform origin-top p-2"
          style={{
            transform: `scale(${zoom / 100})`,
            maxWidth: isPdf ? "100%" : "100%",
          }}
        >
          {isPdf ? (
            <iframe
              src={imageSrc}
              className="w-full h-[700px] bg-white"
              title="Answer Sheet PDF"
            />
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Answer Sheet"
                className="w-full"
              />
              {answers.map((answer) => {
                if (!answer.boundingBox || answer.status === "unanswered")
                  return null;
                const { x, y, width, height } = answer.boundingBox;
                const isSelected = answer.questionId === selectedId;

                return (
                  <div
                    key={answer.questionId}
                    data-question-id={answer.questionId}
                    className={`absolute rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-[#3DD218] bg-[rgba(94,255,53,0.1)] z-10"
                        : "border-[#3DD218]/60 bg-[rgba(94,255,53,0.05)]"
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                  >
                    <span className="absolute -top-7 left-3.5 px-3 py-1 text-base font-bold tracking-[-0.04em] text-white bg-veda-success rounded-t-xl">
                      Q{answer.questionNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedAnswer?.answerText && (
        <div className="px-4 py-2 bg-veda-bg-off-white border-t border-black/5 text-sm tracking-[-0.04em] text-veda-text-muted shrink-0">
          <span className="font-bold text-veda-text">
            Q{selectedAnswer.questionNumber}:
          </span>{" "}
          {selectedAnswer.answerText.slice(0, 100)}
          {selectedAnswer.answerText.length > 100 ? "..." : ""}
        </div>
      )}
    </div>
  );
}
