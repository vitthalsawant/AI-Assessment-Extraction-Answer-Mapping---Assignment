"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuestionList from "@/components/results/QuestionList";
import AnswerSheetViewer from "@/components/results/AnswerSheetViewer";
import ResultsMobileTabs, {
  ResultsTab,
} from "@/components/results/ResultsMobileTabs";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import { parseApiJson } from "@/lib/api-client";
import {
  estimateAnswerBoundingBox,
  isDisplayableBoundingBox,
  pickBetterBoundingBox,
} from "@/lib/bounding-box";
import { ExtractionSession, MappedAnswer } from "@/lib/types";
import { IconAlertTriangle, IconArrowLeft } from "@/components/icons/VedaIcons";
import Link from "next/link";
import {
  PROCESSING_MAX_WAIT_MS,
  SESSION_POLL_INTERVAL_MS,
} from "@/lib/session-config";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<ExtractionSession | null>(null);
  const [mappedAnswers, setMappedAnswers] = useState<MappedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<ResultsTab>("questions");
  const refinedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const startedAt = Date.now();

    async function fetchSession() {
      setLoading(true);
      setError(null);

      while (!cancelled) {
        try {
          const res = await fetch(`/api/session/${sessionId}`, {
            cache: "no-store",
          });
          const data = await parseApiJson<
            ExtractionSession & { error?: string }
          >(res);

          if (res.status === 404) {
            if (Date.now() - startedAt < 10_000) {
              await sleep(SESSION_POLL_INTERVAL_MS);
              continue;
            }
            throw new Error(
              data.error || "Session not found or expired. Please upload files again."
            );
          }

          if (!res.ok && data.status !== "processing") {
            throw new Error(data.error || "Failed to load results.");
          }

          if (data.status === "processing") {
            if (Date.now() - startedAt >= PROCESSING_MAX_WAIT_MS) {
              throw new Error(
                "Extraction is taking longer than expected (over 20 minutes). Please try again."
              );
            }
            await sleep(SESSION_POLL_INTERVAL_MS);
            continue;
          }

          if (data.status === "failed") {
            throw new Error(data.error || "Extraction failed. Please try again.");
          }

          setSession(data);
          setMappedAnswers(data.mappedAnswers || []);
          if (data.mappedAnswers?.length > 0) {
            setSelectedId(data.mappedAnswers[0].questionId);
          }
          break;
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to load results."
            );
          }
          break;
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!selectedId || !sessionId) return;

    const answer = mappedAnswers.find((item) => item.questionId === selectedId);
    if (!answer || answer.status === "unanswered") return;

    if (isDisplayableBoundingBox(answer.boundingBox)) {
      refinedIdsRef.current.add(selectedId);
      return;
    }

    if (refinedIdsRef.current.has(selectedId)) return;

    let cancelled = false;

    async function refineRegion() {
      if (!selectedId) return;
      setRefiningId(selectedId);

      try {
        const res = await fetch(`/api/session/${sessionId}/refine-region`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: selectedId }),
        });

        const data = await res.json();
        if (cancelled) return;

        refinedIdsRef.current.add(selectedId);

        setMappedAnswers((prev) => {
          const current = prev.find((item) => item.questionId === selectedId);
          if (!current) return prev;

          const refinedBox =
            res.ok && data.boundingBox ? data.boundingBox : undefined;
          const betterBox = pickBetterBoundingBox(
            current.boundingBox,
            refinedBox
          );

          if (betterBox) {
            return prev.map((item) =>
              item.questionId === selectedId
                ? {
                    ...item,
                    boundingBox: betterBox,
                    pageNumber:
                      data.pageNumber ?? item.pageNumber ?? item.pageNumber ?? 1,
                  }
                : item
            );
          }

          if (isDisplayableBoundingBox(current.boundingBox)) return prev;

          const fallback = estimateAnswerBoundingBox(prev, selectedId);
          if (!fallback) return prev;

          return prev.map((item) =>
            item.questionId === selectedId
              ? { ...item, boundingBox: fallback, pageNumber: 1 }
              : item
          );
        });
      } finally {
        if (!cancelled) setRefiningId(null);
      }
    }

    refineRegion();

    return () => {
      cancelled = true;
    };
  }, [selectedId, sessionId, mappedAnswers.length]);

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
        <div className="flex h-full flex-col items-center justify-center gap-4 overflow-hidden bg-white px-6">
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
  const selectedAnswer = mappedAnswers.find(
    (item) => item.questionId === selectedId
  );
  const isRefiningSelected =
    refiningId === selectedId &&
    !isDisplayableBoundingBox(selectedAnswer?.boundingBox);

  const handleSelectQuestion = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMobileTab("sheet");
    }
  };

  return (
    <DashboardLayout
      variant="default"
      collapsedSidebar
      showBack
      backHref="/"
      fullBleed
    >
      <div className="flex h-full flex-col gap-2 px-3 pb-3 pt-1 lg:gap-3 lg:p-3">
        <ResultsMobileTabs activeTab={mobileTab} onChange={setMobileTab} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
          <div
            className={`min-h-0 ${
              mobileTab === "questions" ? "flex" : "hidden"
            } lg:flex`}
          >
            <QuestionList
              answers={mappedAnswers}
              selectedId={selectedId}
              onSelect={handleSelectQuestion}
            />
          </div>
          <div
            className={`min-h-0 ${
              mobileTab === "sheet" ? "flex" : "hidden"
            } lg:flex`}
          >
            <AnswerSheetViewer
              imageSrc={imageSrc}
              mimeType={session.answerSheetMime}
              answers={mappedAnswers}
              selectedId={selectedId}
              isRefining={isRefiningSelected}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
