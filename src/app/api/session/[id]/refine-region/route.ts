import { NextRequest, NextResponse } from "next/server";
import { refineSingleAnswerRegion } from "@/lib/gemini";
import { getSession, updateSession } from "@/lib/storage";
import { isDisplayableBoundingBox, pickBetterBoundingBox } from "@/lib/bounding-box";

export const maxDuration = 120;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const questionId = body?.questionId as string | undefined;

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required." },
        { status: 400 }
      );
    }

    const refined = await refineSingleAnswerRegion(
      session.answerSheetMime,
      session.answerSheetBase64,
      session.mappedAnswers,
      questionId
    );

    const current = session.mappedAnswers.find(
      (answer) => answer.questionId === questionId
    );
    const betterBox = pickBetterBoundingBox(
      current?.boundingBox,
      refined?.boundingBox
    );

    if (!betterBox) {
      return NextResponse.json(
        { error: "Could not locate the answer region on the sheet." },
        { status: 422 }
      );
    }

    const mappedAnswers = session.mappedAnswers.map((answer) =>
      answer.questionId === questionId
        ? {
            ...answer,
            boundingBox: betterBox,
            pageNumber: refined?.pageNumber ?? answer.pageNumber ?? 1,
          }
        : answer
    );

    await updateSession(id, { mappedAnswers });

    return NextResponse.json({
      questionId,
      boundingBox: betterBox,
      pageNumber: refined?.pageNumber ?? current?.pageNumber ?? 1,
    });
  } catch (error) {
    console.error("Refine region error:", error);
    return NextResponse.json(
      { error: "Failed to refine answer region." },
      { status: 500 }
    );
  }
}
