import {
  extractQuestions,
  extractAnswers,
  mapAnswersToQuestions,
  computeStats,
  generateAiFeedback,
  refineAnswerBoundingBoxes,
} from "@/lib/gemini";
import { updateSession } from "@/lib/storage";
import { ExtractionSession } from "@/lib/types";

export async function runExtractionPipeline(
  sessionId: string,
  qpMime: string,
  qpBase64: string,
  asMime: string,
  asBase64: string
): Promise<void> {
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
    const mappedWithRegions = await refineAnswerBoundingBoxes(
      asMime,
      asBase64,
      mappedAnswers
    );
    const mappedWithFeedback = await generateAiFeedback(mappedWithRegions);
    const stats = computeStats(mappedWithFeedback);

    await updateSession(sessionId, {
      status: "completed",
      questions,
      mappedAnswers: mappedWithFeedback,
      stats,
      error: undefined,
    });
  } catch (extractError) {
    const message =
      extractError instanceof Error
        ? extractError.message
        : "Extraction failed. Please try again with clearer images.";

    await updateSession(sessionId, {
      status: "failed",
      error: message,
    });
  }
}

export function createProcessingSession(input: {
  sessionId: string;
  questionPaperName: string;
  answerSheetName: string;
  qpMime: string;
  asMime: string;
  qpBase64: string;
  asBase64: string;
}): ExtractionSession {
  return {
    id: input.sessionId,
    createdAt: new Date().toISOString(),
    status: "processing",
    questionPaperName: input.questionPaperName,
    answerSheetName: input.answerSheetName,
    questionPaperMime: input.qpMime,
    answerSheetMime: input.asMime,
    questionPaperBase64: input.qpBase64,
    answerSheetBase64: input.asBase64,
    questions: [],
    mappedAnswers: [],
    stats: { totalQuestions: 0, answered: 0, unanswered: 0, partial: 0 },
  };
}
