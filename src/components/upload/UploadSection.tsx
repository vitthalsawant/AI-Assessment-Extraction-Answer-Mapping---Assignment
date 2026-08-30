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
    <DashboardLayout
      variant="upload"
      showBack={isProcessing}
      collapsedSidebar={isProcessing}
    >
      {isProcessing ? (
        <ProcessingOverlay />
      ) : (
        <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden px-4 pb-6 pt-1 sm:px-6 lg:justify-center lg:overflow-hidden lg:px-4 lg:pb-4">
          <div className="mx-auto flex w-full max-w-[789px] flex-col items-center gap-3 sm:gap-4">
            <div className="flex shrink-0 flex-col items-center gap-1 text-center">
              <h1 className="text-[22px] font-bold leading-[1.25] tracking-[-0.04em] text-veda-dark sm:text-3xl sm:leading-tight lg:text-[40px] lg:leading-[48px]">
                <span className="lg:hidden">
                  Upload{" "}
                  <span className="veda-title-highlight">Question</span> Paper
                  <br />
                  &amp; Answer Sheets
                </span>
                <span className="hidden lg:inline">
                  Upload{" "}
                  <span className="veda-title-highlight">
                    Question Paper &amp; Answer Sheets
                  </span>
                </span>
              </h1>
              <p className="hidden text-base tracking-[-0.04em] text-veda-text sm:block lg:text-xl lg:leading-7">
                Upload both files to get started
              </p>
            </div>

            <div className="my-1 shrink-0 sm:my-2 lg:my-0">
              <TeacherIllustration />
            </div>

            <div className="w-full shrink-0 rounded-2xl bg-white/50 p-2 sm:rounded-3xl sm:p-3">
              <div className="flex flex-col gap-3 md:flex-row">
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

            <div className="mt-2 flex w-full shrink-0 flex-col items-center gap-2 sm:mt-0">
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
              <p className="max-w-[410px] px-2 text-center text-xs leading-4 tracking-[-0.06em] text-veda-text-muted sm:text-sm">
                Once both files are uploaded, you&apos;ll be able to map answers
                with questions
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
