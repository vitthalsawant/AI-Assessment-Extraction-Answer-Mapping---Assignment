"use client";

import { useState } from "react";
import { IconChevronDownSmall, IconChevronUp } from "@/components/icons/VedaIcons";
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
      className={`px-3 py-1 rounded-full text-base font-bold tracking-[-0.04em] ${styles[variant]}`}
    >
      {text}
    </span>
  );
}

export default function QuestionList({
  answers,
  selectedId,
  onSelect,
}: QuestionListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
    setExpandedIds(new Set(answers.map((a) => a.questionId)));
  };

  return (
    <div className="flex flex-col h-full bg-white/50 rounded-[20px] p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-[-0.04em] text-veda-text">
          Extracted Questions (from question paper)
        </h2>
        <button
          onClick={expandAll}
          className="px-4 py-3 bg-white rounded-full text-sm font-medium tracking-[-0.04em] text-[#181818] hover:bg-veda-bg-off-white transition-colors"
        >
          Expand All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3">
        {answers.map((answer) => {
          const isSelected = selectedId === answer.questionId;
          const isExpanded = expandedIds.has(answer.questionId);
          const score = getScoreDisplay(answer);
          const hasSubLabel = answer.subQuestionLabel;

          return (
            <div key={answer.questionId}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(answer.questionId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(answer.questionId);
                  }
                }}
                className={`w-full text-left bg-white rounded-2xl p-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#FF8D36]"
                    : "border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xl tracking-[-0.04em] border-2 border-white/25 shadow-sm ${
                        isSelected ? "bg-veda-orange" : "bg-[rgba(43,43,43,0.8)]"
                      }`}
                    >
                      {answer.questionNumber.replace(/\(.*\)/, "")}
                    </div>
                    {hasSubLabel && (
                      <div className="w-8 h-8 rounded-full bg-veda-bg-off-white flex items-center justify-center text-base font-bold text-veda-text">
                        {answer.subQuestionLabel}.
                      </div>
                    )}
                  </div>

                  <p className="flex-1 text-base tracking-[-0.04em] text-veda-text leading-[22px]">
                    {answer.questionText}
                  </p>

                  <div className="flex items-center gap-4 shrink-0">
                    <ScorePill text={score.text} variant={score.variant} />
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(answer.questionId, e)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse question" : "Expand question"}
                      className="w-7 h-7 flex items-center justify-center bg-veda-bg-off-white rounded-lg"
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

              {isExpanded && answer.answerText && (
                <div className="mt-2 mx-1 bg-veda-bg-off-white rounded-2xl px-6 py-4">
                  <p className="text-base font-bold tracking-[-0.04em] text-veda-text mb-2.5">
                    AI Feedback
                  </p>
                  <p className="text-sm tracking-[-0.04em] text-veda-text leading-5">
                    {answer.status === "answered"
                      ? `Answer extracted: "${answer.answerText.slice(0, 200)}${answer.answerText.length > 200 ? "..." : ""}"`
                      : answer.status === "unreadable"
                        ? "The answer was detected but may be difficult to read. Manual review recommended."
                        : "No answer was detected for this question."}
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
