import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  extractQuestions,
  extractAnswers,
  mapAnswersToQuestions,
  computeStats,
  generateAiFeedback,
} from "@/lib/gemini";
import { saveSession, updateSession } from "@/lib/storage";
import { validateFile, getMimeType } from "@/lib/validation";
import { ExtractionSession } from "@/lib/types";

export const maxDuration = 60;

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const questionPaper = formData.get("questionPaper") as File | null;
    const answerSheet = formData.get("answerSheet") as File | null;

    if (!questionPaper || !answerSheet) {
      return NextResponse.json(
        {
          error:
            "Both question paper and answer sheet are required. Please upload both files.",
        },
        { status: 400 }
      );
    }

    const qpError = validateFile(questionPaper);
    if (qpError) {
      return NextResponse.json({ error: qpError }, { status: 400 });
    }

    const asError = validateFile(answerSheet);
    if (asError) {
      return NextResponse.json({ error: asError }, { status: 400 });
    }

    const sessionId = uuidv4();
    const qpMime = getMimeType(questionPaper);
    const asMime = getMimeType(answerSheet);

    const [qpBase64, asBase64] = await Promise.all([
      fileToBase64(questionPaper),
      fileToBase64(answerSheet),
    ]);

    const session: ExtractionSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      status: "processing",
      questionPaperName: questionPaper.name,
      answerSheetName: answerSheet.name,
      questionPaperMime: qpMime,
      answerSheetMime: asMime,
      questionPaperBase64: qpBase64,
      answerSheetBase64: asBase64,
      questions: [],
      mappedAnswers: [],
      stats: { totalQuestions: 0, answered: 0, unanswered: 0, partial: 0 },
    };

    saveSession(session);

    try {
      const [questions, answers] = await Promise.all([
        extractQuestions(qpMime, qpBase64),
        extractAnswers(asMime, asBase64),
      ]);

      if (questions.length === 0) {
        throw new Error(
          "No questions found in the question paper. Please upload a clearer image or PDF."
        );
      }

      const mappedAnswers = mapAnswersToQuestions(questions, answers);
      const mappedWithFeedback = await generateAiFeedback(mappedAnswers);
      const stats = computeStats(mappedWithFeedback);

      const completed = updateSession(sessionId, {
        status: "completed",
        questions,
        mappedAnswers: mappedWithFeedback,
        stats,
      });

      return NextResponse.json({
        sessionId,
        status: "completed",
        stats: completed?.stats,
      });
    } catch (extractError) {
      const message =
        extractError instanceof Error
          ? extractError.message
          : "Extraction failed. Please try again with clearer images.";

      updateSession(sessionId, {
        status: "failed",
        error: message,
      });

      return NextResponse.json({ error: message, sessionId }, { status: 422 });
    }
  } catch (error) {
    console.error("Extract API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
