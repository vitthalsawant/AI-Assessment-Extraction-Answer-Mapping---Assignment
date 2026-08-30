import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/storage";

export const maxDuration = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) {
    return NextResponse.json(
      { error: "Session not found or expired. Please upload files again." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: session.id,
    status: session.status,
    questionPaperName: session.questionPaperName,
    answerSheetName: session.answerSheetName,
    answerSheetMime: session.answerSheetMime,
    answerSheetBase64: session.answerSheetBase64,
    questions: session.questions,
    mappedAnswers: session.mappedAnswers,
    stats: session.stats,
    error: session.error,
    createdAt: session.createdAt,
  });
}
