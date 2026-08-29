"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuestionList from "@/components/results/QuestionList";
import AnswerSheetViewer from "@/components/results/AnswerSheetViewer";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import { ExtractionSession } from "@/lib/types";
import { IconAlertTriangle, IconArrowLeft } from "@/components/icons/VedaIcons";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<ExtractionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/session/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load results.");
        }

        setSession(data);
        if (data.mappedAnswers?.length > 0) {
          setSelectedId(data.mappedAnswers[0].questionId);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load results."
        );
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <DashboardLayout
        variant="default"
        collapsedSidebar
        showBack
        backHref="/"
        fullBleed
      >
        <ProcessingOverlay />
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout
        variant="default"
        collapsedSidebar
        showBack
        backHref="/"
        fullBleed
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <IconAlertTriangle size={48} className="text-veda-warning" />
          <p className="text-sm text-veda-text-muted text-center">{error}</p>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-veda-orange hover:underline"
          >
            <IconArrowLeft size={16} />
            Back to Upload
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const imageSrc = `data:${session.answerSheetMime};base64,${session.answerSheetBase64}`;

  return (
    <DashboardLayout
      variant="default"
      collapsedSidebar
      showBack
      backHref="/"
      fullBleed
    >
      <div className="p-3 min-h-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[calc(100vh-120px)]">
          <QuestionList
            answers={session.mappedAnswers}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <AnswerSheetViewer
            imageSrc={imageSrc}
            mimeType={session.answerSheetMime}
            answers={session.mappedAnswers}
            selectedId={selectedId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
