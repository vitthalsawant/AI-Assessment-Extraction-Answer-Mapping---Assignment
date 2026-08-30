import { after, NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runExtraction } from "@/lib/run-extraction";
import { saveSession } from "@/lib/storage";
import { validateFile, getMimeType } from "@/lib/validation";
import { ExtractionSession } from "@/lib/types";

export const maxDuration = 300;

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

    await saveSession(session);

    after(async () => {
      await runExtraction(sessionId);
    });

    return NextResponse.json(
      {
        sessionId,
        status: "processing",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Extract API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
