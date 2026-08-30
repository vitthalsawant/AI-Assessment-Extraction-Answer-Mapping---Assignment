"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@/components/icons/VedaIcons";
import { parseApiJson } from "@/lib/api-client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadCard from "@/components/upload/UploadCard";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import TeacherIllustration from "@/components/upload/TeacherIllustration";

export default function UploadSection() {
  const router = useRouter();
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = questionPaper && answerSheet && !isProcessing;

  const handleSubmit = async () => {
    if (!questionPaper || !answerSheet) return;

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("questionPaper", questionPaper);
      formData.append("answerSheet", answerSheet);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      const data = await parseApiJson<{
        sessionId?: string;
        error?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(data.error || "Extraction failed. Please try again.");
      }

      if (!data.sessionId) {
        throw new Error("Extraction completed but no session was returned.");
      }

      router.push(`/results/${data.sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout variant="upload" showBack={isProcessing}>
      {isProcessing ? (
        <ProcessingOverlay />
      ) : (
        <>
          {/* Mobile layout */}
          <div className="flex h-full flex-col overflow-y-auto px-4 pb-6 pt-1 lg:hidden">
            <h1 className="text-center text-[22px] font-bold leading-[1.25] tracking-[-0.04em] text-veda-dark">
              Upload{" "}
              <span className="veda-title-highlight">Question</span> Paper
              <br />
              &amp; Answer Sheets
            </h1>

            <div className="mx-auto my-4 shrink-0 scale-90">
              <TeacherIllustration />
            </div>

            <div className="flex w-full flex-col gap-3">
              <UploadCard
                label="Question Paper"
                file={questionPaper}
                onFileSelect={setQuestionPaper}
              />
              <UploadCard
                label="Answer Sheet"
                file={answerSheet}
                onFileSelect={setAnswerSheet}
              />
            </div>

            {error && (
              <div className="mt-3 w-full rounded-xl border border-red-200 bg-veda-danger-bg p-3 text-center text-sm text-veda-danger">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex items-center gap-2 rounded-full border-2 py-3 pl-6 pr-5 text-sm font-medium tracking-[-0.04em] transition-all ${
                  canSubmit
                    ? "border-white/15 bg-veda-text text-white shadow-[0px_4px_5px_rgba(0,0,0,0.12)] hover:bg-[#1a1a1a]"
                    : "cursor-not-allowed border-white/15 bg-veda-text/25 text-white"
                }`}
              >
                Start Mapping
                <IconArrowRight size={20} />
              </button>
              <p className="max-w-[320px] px-2 text-center text-xs leading-4 tracking-[-0.06em] text-veda-text-muted">
                Once both files are uploaded, you&apos;ll be able to map answers
                with questions
              </p>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden h-full flex-col items-center justify-center overflow-hidden px-4 lg:flex">
            <div className="flex w-full max-w-[789px] flex-col items-center gap-3">
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[40px] font-bold leading-[48px] tracking-[-0.04em] text-veda-dark">
                    Upload
                  </span>
                  <span className="veda-title-highlight text-[40px] font-bold leading-[48px] tracking-[-0.04em]">
                    Question Paper & Answer Sheets
                  </span>
                </div>
                <p className="text-xl leading-7 tracking-[-0.04em] text-veda-text">
                  Upload both files to get started
                </p>
              </div>

              <div className="shrink-0">
                <TeacherIllustration />
              </div>

              <div className="w-full shrink-0 rounded-3xl bg-white/50 p-3">
                <div className="flex flex-row gap-3">
                  <UploadCard
                    label="Question Paper"
                    file={questionPaper}
                    onFileSelect={setQuestionPaper}
                  />
                  <UploadCard
                    label="Answer Sheet"
                    file={answerSheet}
                    onFileSelect={setAnswerSheet}
                  />
                </div>
              </div>

              {error && (
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-veda-danger-bg p-3 text-center text-sm text-veda-danger">
                  {error}
                </div>
              )}

              <div className="flex shrink-0 flex-col items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 rounded-full border-2 py-3 pl-6 pr-5 text-sm font-medium tracking-[-0.04em] transition-all ${
                    canSubmit
                      ? "border-white/15 bg-veda-text text-white shadow-[0px_4px_5px_rgba(0,0,0,0.12)] hover:bg-[#1a1a1a]"
                      : "cursor-not-allowed border-white/15 bg-veda-text/25 text-white"
                  }`}
                >
                  Start Mapping
                  <IconArrowRight size={20} />
                </button>
                <p className="max-w-[410px] text-center text-sm tracking-[-0.06em] text-veda-text-muted">
                  Once both files are uploaded, you&apos;ll be able to map
                  answers with questions
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
