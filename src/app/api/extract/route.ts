import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createProcessingSession,
  runExtractionPipeline,
} from "@/lib/extraction";
import { saveSession } from "@/lib/storage";
import { validateFile, getMimeType } from "@/lib/validation";

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

    const session = createProcessingSession({
      sessionId,
      questionPaperName: questionPaper.name,
      answerSheetName: answerSheet.name,
      qpMime,
      asMime,
      qpBase64,
      asBase64,
    });

    await saveSession(session);

    after(async () => {
      await runExtractionPipeline(
        sessionId,
        qpMime,
        qpBase64,
        asMime,
        asBase64
      );
    });

    return NextResponse.json({
      sessionId,
      status: "processing",
    });
  } catch (error) {
    console.error("Extract API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
