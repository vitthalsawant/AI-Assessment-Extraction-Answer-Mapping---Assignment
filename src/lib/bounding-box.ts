import { BoundingBox, MappedAnswer } from "./types";

export function clampBoundingBox(box: BoundingBox): BoundingBox {
  const x = Math.max(0, Math.min(100, Number(box.x) || 0));
  const y = Math.max(0, Math.min(100, Number(box.y) || 0));
  const width = Math.max(1, Math.min(100 - x, Number(box.width) || 1));
  const height = Math.max(1, Math.min(100 - y, Number(box.height) || 1));

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
  };
}

function detectScale(maxValue: number): number {
  if (maxValue <= 1) return 0.01;
  if (maxValue <= 100) return 1;
  if (maxValue <= 1000) return 10;
  return 100;
}

export function normalizeBoundingBox(raw: unknown): BoundingBox | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const value = raw as Record<string, number>;

  if (
    value.xmin !== undefined ||
    value.xMin !== undefined ||
    value.ymin !== undefined ||
    value.yMin !== undefined
  ) {
    const xmin = value.xmin ?? value.xMin ?? 0;
    const ymin = value.ymin ?? value.yMin ?? 0;
    const xmax = value.xmax ?? value.xMax ?? xmin;
    const ymax = value.ymax ?? value.yMax ?? ymin;
    const scale = detectScale(Math.max(xmax, ymax, xmax - xmin, ymax - ymin));

    return clampBoundingBox({
      x: xmin / scale,
      y: ymin / scale,
      width: (xmax - xmin) / scale,
      height: (ymax - ymin) / scale,
    });
  }

  const x = value.x ?? value.left;
  const y = value.y ?? value.top;
  const width = value.width ?? value.w;
  const height = value.height ?? value.h;

  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return undefined;
  }

  const scale = detectScale(Math.max(x, y, width, height, x + width, y + height));

  return clampBoundingBox({
    x: x / scale,
    y: y / scale,
    width: width / scale,
    height: height / scale,
  });
}

export function isValidBoundingBox(box?: BoundingBox): boolean {
  if (!box) return false;
  return (
    box.width >= 0.5 &&
    box.height >= 0.5 &&
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= 100.5 &&
    box.y + box.height <= 100.5
  );
}

export function isLikelyEstimatedBox(box: BoundingBox): boolean {
  return box.width >= 85 && box.x <= 6;
}

/** Valid extraction box we can show on the sheet (less strict than isGoodHighlightBox). */
export function isDisplayableBoundingBox(box?: BoundingBox): boolean {
  if (!box || !isValidBoundingBox(box)) return false;
  if (isLikelyEstimatedBox(box)) return false;
  return true;
}

export function isGoodHighlightBox(box?: BoundingBox): boolean {
  if (!box || !isDisplayableBoundingBox(box)) return false;
  if (box.width > 78 || box.height > 35) return false;
  return true;
}

export function pickBetterBoundingBox(
  current: BoundingBox | undefined,
  candidate: BoundingBox | undefined
): BoundingBox | undefined {
  if (!candidate || !isValidBoundingBox(candidate)) return current;
  if (!isDisplayableBoundingBox(candidate)) return current;

  if (!current || !isDisplayableBoundingBox(current)) {
    return isGoodHighlightBox(candidate) ? candidate : current;
  }

  if (!isGoodHighlightBox(candidate)) return current;
  if (!isGoodHighlightBox(current)) return candidate;

  const currentArea = current.width * current.height;
  const candidateArea = candidate.width * candidate.height;

  return candidateArea <= currentArea * 1.35 ? candidate : current;
}

export function padBoundingBox(box: BoundingBox, padding = 0.4): BoundingBox {
  return clampBoundingBox({
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  });
}

function parseQuestionOrder(questionNumber: string): number {
  const match = questionNumber.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 1;
}

export function estimateAnswerBoundingBox(
  answers: MappedAnswer[],
  questionId: string
): BoundingBox | undefined {
  const answer = answers.find((item) => item.questionId === questionId);
  if (!answer || answer.status === "unanswered") return undefined;

  const answered = answers.filter((item) => item.status !== "unanswered");
  const answeredIndex = answered.findIndex(
    (item) => item.questionId === questionId
  );
  if (answeredIndex < 0) return undefined;

  const slotHeight = Math.min(72 / Math.max(answered.length, 1), 10);

  return clampBoundingBox({
    x: 6,
    y: 6 + answeredIndex * (slotHeight + 2.5),
    width: 86,
    height: Math.max(slotHeight, 4),
  });
}

export function getHighlightBoundingBox(
  answers: MappedAnswer[],
  questionId: string | null,
  options?: { allowEstimate?: boolean }
): { box: BoundingBox; answer: MappedAnswer; estimated: boolean } | null {
  if (!questionId) return null;

  const answer = answers.find((item) => item.questionId === questionId);
  if (!answer || answer.status === "unanswered") return null;

  const hasAiBox = isDisplayableBoundingBox(answer.boundingBox);

  if (hasAiBox && answer.boundingBox) {
    return { box: answer.boundingBox, answer, estimated: false };
  }

  if (!options?.allowEstimate) return null;

  const estimated = estimateAnswerBoundingBox(answers, questionId);
  if (!estimated) return null;

  return { box: estimated, answer, estimated: true };
}
