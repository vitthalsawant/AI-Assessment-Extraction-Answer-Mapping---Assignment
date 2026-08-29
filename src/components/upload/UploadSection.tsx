"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@/components/icons/VedaIcons";
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Extraction failed. Please try again.");
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
    <DashboardLayout variant="upload">
      {isProcessing ? (
        <ProcessingOverlay />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-10 lg:py-16">
          <div className="flex flex-col items-center gap-5 max-w-[789px] w-full">
            {/* Title */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-[40px] font-bold leading-[48px] tracking-[-0.04em] text-veda-dark">
                  Upload
                </span>
                <span className="veda-title-highlight text-[40px] font-bold leading-[48px] tracking-[-0.04em]">
                  Question Paper & Answer Sheets
                </span>
              </div>
              <p className="text-xl tracking-[-0.04em] text-veda-text">
                Upload both files to get started
              </p>
            </div>

            {/* Teacher illustration */}
            <TeacherIllustration />

            {/* Upload cards container */}
            <div className="w-full bg-white/50 rounded-3xl p-3">
              <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="w-full max-w-md p-3 rounded-xl bg-veda-danger-bg border border-red-200 text-sm text-veda-danger text-center">
                {error}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex items-center gap-2 pl-6 pr-5 py-3 rounded-full text-sm font-medium tracking-[-0.04em] transition-all border-2 ${
                  canSubmit
                    ? "bg-veda-text text-white border-white/15 shadow-[0px_4px_5px_rgba(0,0,0,0.12)] hover:bg-[#1a1a1a]"
                    : "bg-veda-text/25 text-white border-white/15 cursor-not-allowed"
                }`}
              >
                Start Mapping
                <IconArrowRight size={20} />
              </button>
              <p className="text-sm tracking-[-0.06em] text-veda-text-muted text-center max-w-[410px]">
                Once both files are uploaded, you&apos;ll able to map answers with
                questions
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
