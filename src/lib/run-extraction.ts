import {
  extractQuestions,
  extractAnswers,
  mapAnswersToQuestions,
  computeStats,
} from "@/lib/gemini";
import { getSession, updateSession } from "@/lib/storage";

export async function runExtraction(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session || session.status !== "processing") return;

  try {
    const [questions, answers] = await Promise.all([
      extractQuestions(session.questionPaperMime, session.questionPaperBase64),
      extractAnswers(session.answerSheetMime, session.answerSheetBase64),
    ]);

    if (questions.length === 0) {
      throw new Error(
        "No questions found in the question paper. Please upload a clearer image or PDF."
      );
    }

    const mappedAnswers = mapAnswersToQuestions(questions, answers);
    const stats = computeStats(mappedAnswers);

    await updateSession(sessionId, {
      status: "completed",
      questions,
      mappedAnswers,
      stats,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Extraction failed. Please try again with clearer images.";

    await updateSession(sessionId, {
      status: "failed",
      error: message,
    });
  }
}
