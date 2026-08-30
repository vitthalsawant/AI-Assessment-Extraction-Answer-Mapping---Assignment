"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDownSmall, IconChevronUp } from "@/components/icons/VedaIcons";
import { buildFeedback } from "@/lib/feedback";
import { MappedAnswer } from "@/lib/types";

interface QuestionListProps {
  answers: MappedAnswer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function getScoreDisplay(answer: MappedAnswer): {
  text: string;
  variant: "success" | "danger" | "warning";
} {
  if (answer.status === "unanswered") {
    return { text: "0 / 2", variant: "danger" };
  }
  if (answer.status === "unreadable" || answer.status === "partial") {
    return { text: "1 / 3", variant: "warning" };
  }
  if (answer.confidence === "low") {
    return { text: "3 / 5", variant: "warning" };
  }
  if (answer.confidence === "medium") {
    return { text: "4 / 5", variant: "success" };
  }
  return { text: "2 / 2", variant: "success" };
}

function ScorePill({ text, variant }: { text: string; variant: "success" | "danger" | "warning" }) {
  const styles = {
    success: "bg-veda-success-bg text-veda-success",
    danger: "bg-veda-danger-bg text-veda-danger",
    warning: "bg-veda-warning-bg text-veda-warning",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold tracking-[-0.04em] sm:px-3 sm:py-1 sm:text-base ${styles[variant]}`}
    >
      {text}
    </span>
  );
}

function getFeedbackText(answer: MappedAnswer): string {
  return answer.aiFeedback || buildFeedback(answer);
}

export default function QuestionList({
  answers,
  selectedId,
  onSelect,
}: QuestionListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedId) return;

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(selectedId);
      return next;
    });

    const card = cardRefs.current.get(selectedId);
    card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(answers.map((answer) => answer.questionId)));
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-[20px] bg-white/50 p-3 lg:gap-4 lg:p-4">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="min-w-0 text-xs font-bold leading-5 tracking-[-0.04em] text-veda-text sm:text-sm lg:text-base">
          Extracted Questions (from question paper)
        </h2>
        <button
          type="button"
          onClick={expandAll}
          className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-medium tracking-[-0.04em] text-[#181818] transition-colors hover:bg-veda-bg-off-white sm:px-4 sm:py-3 sm:text-sm"
        >
          Expand All
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {answers.map((answer) => {
          const isSelected = selectedId === answer.questionId;
          const isExpanded = expandedIds.has(answer.questionId);
          const showFeedback = isExpanded || isSelected;
          const score = getScoreDisplay(answer);
          const hasSubLabel = answer.subQuestionLabel;

          return (
            <div
              key={answer.questionId}
              ref={(node) => {
                if (node) cardRefs.current.set(answer.questionId, node);
                else cardRefs.current.delete(answer.questionId);
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(answer.questionId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(answer.questionId);
                  }
                }}
                className={`w-full cursor-pointer rounded-2xl bg-white p-2.5 text-left transition-all sm:p-3 ${
                  isSelected
                    ? "border-2 border-[#FF8D36]"
                    : "border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/25 text-base font-extrabold tracking-[-0.04em] text-white shadow-sm sm:h-8 sm:w-8 sm:text-xl ${
                        isSelected ? "bg-veda-orange" : "bg-[rgba(43,43,43,0.8)]"
                      }`}
                    >
                      {answer.questionNumber.replace(/\(.*\)/, "")}
                    </div>
                    {hasSubLabel && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-veda-bg-off-white text-base font-bold text-veda-text">
                        {answer.subQuestionLabel}.
                      </div>
                    )}
                  </div>

                  <p className="flex-1 text-sm leading-5 tracking-[-0.04em] text-veda-text sm:text-base sm:leading-[22px]">
                    {answer.questionText}
                  </p>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <ScorePill text={score.text} variant={score.variant} />
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(answer.questionId, e)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse question" : "Expand question"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-veda-bg-off-white"
                    >
                      {isExpanded ? (
                        <IconChevronUp size={20} className="text-[#1E1E1E]" />
                      ) : (
                        <IconChevronDownSmall size={20} className="text-[#1E1E1E]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {showFeedback && (
                <div className="mx-1 mt-2 rounded-2xl bg-veda-bg-off-white px-4 py-3 sm:px-6 sm:py-4">
                  <p className="mb-2 text-sm font-bold tracking-[-0.04em] text-veda-text sm:mb-2.5 sm:text-base">
                    AI Feedback
                  </p>
                  <p className="text-sm leading-5 tracking-[-0.04em] text-veda-text">
                    {getFeedbackText(answer)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
