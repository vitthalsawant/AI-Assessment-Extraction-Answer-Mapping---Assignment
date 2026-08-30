import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  clampBoundingBox,
  isValidBoundingBox,
  normalizeBoundingBox,
  padBoundingBox,
} from "./bounding-box";
import { buildFeedback } from "./feedback";
import {
  ExtractedAnswer,
  ExtractedQuestion,
  MappedAnswer,
  BoundingBox,
} from "./types";

const QUESTION_EXTRACTION_PROMPT = `You are an expert at reading exam question papers. Analyze the uploaded question paper image/PDF and extract ALL questions in structured JSON format.

Rules:
1. Extract every question including sub-questions (e.g., Q1(a), Q1(b), Q2, etc.)
2. Preserve the exact question numbering as shown on the paper
3. Include the full question text
4. Identify question type: mcq, short, long, subjective, or other
5. Include marks if visible
6. For questions with sub-parts, include subQuestions array with id, label (e.g., "a", "b"), and text

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "questions": [
    {
      "id": "q1",
      "number": "1",
      "text": "Full question text here",
      "type": "short",
      "marks": 5,
      "subQuestions": [
        { "id": "q1a", "label": "a", "text": "Sub-question text" }
      ]
    }
  ]
}`;

const ANSWER_EXTRACTION_PROMPT = `You are an expert at reading handwritten and typed answer sheets. Analyze the uploaded answer sheet and extract ALL student answers.

Rules:
1. Extract answers even if they are out of order on the paper
2. Match each answer to its question number (e.g., "1", "2", "3a", "3b", "Q4")
3. Normalize question numbers to match standard format (remove "Q" prefix, use lowercase for sub-parts)
4. If handwriting is illegible, set isUnreadable to true and provide best guess in answerText
5. For EACH answer, return a TIGHT boundingBox around ONLY the student's handwritten/typed response
   - Exclude printed question numbers, sheet headers, and other answers
   - Box must hug the answer ink/text closely (typical width 15-70%, height 3-15% of page)
   - Use percentages 0-100 relative to the page in pageNumber: x=left, y=top, width, height
6. Set confidence: high (clear text), medium (partially clear), low (hard to read)
7. Include pageNumber (1-based) indicating which page of the answer sheet the answer appears on

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "answers": [
    {
      "questionNumber": "1",
      "subQuestionLabel": null,
      "answerText": "The student's answer text",
      "confidence": "high",
      "boundingBox": { "x": 10, "y": 20, "width": 80, "height": 15 },
      "pageNumber": 1,
      "isUnreadable": false
    },
    {
      "questionNumber": "2",
      "subQuestionLabel": "a",
      "answerText": "Answer for sub-question 2a",
      "confidence": "medium",
      "boundingBox": { "x": 10, "y": 40, "width": 80, "height": 10 },
      "pageNumber": 1,
      "isUnreadable": false
    }
  ]
}`;

function getModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.6-flash",
  ];
  return configured ? [configured, ...defaults.filter((m) => m !== configured)] : defaults;
}

function getExtractionModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  const fastDefaults = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
  ];
  return configured
    ? [configured, ...fastDefaults.filter((m) => m !== configured)]
    : fastDefaults;
}

function isModelNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("no longer available")
  );
}

function formatGeminiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
    return "Invalid Gemini API key. Get a free key from https://aistudio.google.com/apikey (starts with AIza...).";
  }

  if (isModelNotFoundError(message)) {
    return "Gemini model unavailable. Set GEMINI_MODEL in .env (try gemini-3.6-flash or gemini-flash-latest).";
  }

  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return "Gemini API rate limit reached. Wait a minute and try again.";
  }

  return message;
}

function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error("Failed to parse AI response as JSON.");
  }
}

async function callGeminiWithFile(
  mimeType: string,
  base64Data: string,
  prompt: string,
  modelCandidates: string[] = getModelCandidates()
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your environment variables."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = modelCandidates;
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      });

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);

      const response = result.response;
      const text = response.text();
      if (!text) {
        throw new Error(
          "Gemini returned an empty response. The image may be too low quality."
        );
      }

      return text;
    } catch (error) {
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw new Error(formatGeminiError(error));
      }
    }
  }

  throw new Error(formatGeminiError(lastError));
}

async function callGeminiText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your environment variables."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = getModelCandidates();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }
      return text;
    } catch (error) {
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw new Error(formatGeminiError(error));
      }
    }
  }

  throw new Error(formatGeminiError(lastError));
}

export async function extractQuestions(
  mimeType: string,
  base64Data: string
): Promise<ExtractedQuestion[]> {
  const text = await callGeminiWithFile(
    mimeType,
    base64Data,
    QUESTION_EXTRACTION_PROMPT,
    getExtractionModelCandidates()
  );

  const parsed = parseJsonResponse<{ questions: ExtractedQuestion[] }>(text);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Could not extract questions from the question paper.");
  }

  return parsed.questions.map((q, i) => ({
    ...q,
    id: q.id || `q${i + 1}`,
    number: String(q.number),
    type: q.type || "other",
  }));
}

export async function extractAnswers(
  mimeType: string,
  base64Data: string
): Promise<ExtractedAnswer[]> {
  const text = await callGeminiWithFile(
    mimeType,
    base64Data,
    ANSWER_EXTRACTION_PROMPT,
    getExtractionModelCandidates()
  );

  const parsed = parseJsonResponse<{ answers: ExtractedAnswer[] }>(text);
  if (!parsed.answers || !Array.isArray(parsed.answers)) {
    throw new Error("Could not extract answers from the answer sheet.");
  }

  return parsed.answers.map((a) => ({
    ...a,
    questionNumber: normalizeQuestionNumber(a.questionNumber),
    subQuestionLabel: a.subQuestionLabel
      ? a.subQuestionLabel.toLowerCase()
      : undefined,
    pageNumber: a.pageNumber && a.pageNumber > 0 ? a.pageNumber : 1,
    boundingBox: normalizeBoundingBox(a.boundingBox),
  }));
}

function normalizeQuestionNumber(num: string): string {
  return num.replace(/^Q\.?\s*/i, "").trim();
}

function buildAnswerKey(answer: ExtractedAnswer): string {
  const sub = answer.subQuestionLabel ? answer.subQuestionLabel.toLowerCase() : "";
  return `${answer.questionNumber}:${sub}`;
}

export function mapAnswersToQuestions(
  questions: ExtractedQuestion[],
  answers: ExtractedAnswer[]
): MappedAnswer[] {
  const answerMap = new Map<string, ExtractedAnswer>();
  for (const answer of answers) {
    const key = buildAnswerKey(answer);
    answerMap.set(key, answer);
  }

  const mappedAnswers: MappedAnswer[] = [];

  for (const question of questions) {
    if (question.subQuestions && question.subQuestions.length > 0) {
      for (const sub of question.subQuestions) {
        const key = `${question.number}:${sub.label.toLowerCase()}`;
        const answer = answerMap.get(key);
        mappedAnswers.push(createMappedAnswer(question, sub.text, sub.label, answer));
      }
    } else {
      const key = `${question.number}:`;
      const answer =
        answerMap.get(key) ||
        answerMap.get(`${question.number}:null`) ||
        findFuzzyAnswer(answerMap, question.number);
      mappedAnswers.push(createMappedAnswer(question, question.text, undefined, answer));
    }
  }

  const enriched = mappedAnswers.map((answer) => enrichMappedAnswer(answer));
  return enriched;
}

function enrichMappedAnswer(answer: MappedAnswer): MappedAnswer {
  const enriched = { ...answer };

  if (!enriched.pageNumber) {
    enriched.pageNumber = 1;
  }

  if (enriched.boundingBox) {
    enriched.boundingBox = padBoundingBox(
      clampBoundingBox(enriched.boundingBox),
      0.3
    );
  }

  return enriched;
}

function buildRegionLookupKey(
  questionNumber: string,
  subQuestionLabel?: string | null
): string {
  const sub = subQuestionLabel ? subQuestionLabel.toLowerCase() : "";
  return `${normalizeQuestionNumber(questionNumber)}:${sub}`;
}

function buildRefineRegionsPrompt(
  answers: MappedAnswer[],
  singleQuestionId?: string
): string {
  const targets = answers
    .filter((answer) => answer.status !== "unanswered" && answer.answerText)
    .filter((answer) => !singleQuestionId || answer.questionId === singleQuestionId)
    .map((answer) => ({
      questionId: answer.questionId,
      questionNumber: answer.questionNumber,
      subQuestionLabel: answer.subQuestionLabel ?? null,
      answerText: answer.answerText,
      pageNumber: answer.pageNumber ?? 1,
    }));

  return `You are an expert at locating handwritten answers on exam answer sheets.

Study the document carefully. For each item below, find the EXACT tight region containing ONLY that student's answer ink/text.

CRITICAL coordinate rules:
- boundingBox uses percentages 0-100 relative to the SPECIFIC PAGE given in pageNumber
- x = left edge of answer handwriting, y = top edge, width = horizontal span, height = vertical span
- Box must tightly wrap the answer — NOT the question label, NOT the full line width, NOT neighboring answers
- Typical answers are small regions (width 15-70%, height 3-15%), not full-page boxes
- If multi-page PDF, coordinates are per-page (page 1 = first page only)

Return ONLY valid JSON (no markdown):
{
  "regions": [
    {
      "questionId": "q2",
      "boundingBox": { "x": 12.5, "y": 34.2, "width": 42.0, "height": 6.5 },
      "pageNumber": 1
    }
  ]
}

Items to locate:
${JSON.stringify(targets)}`;
}

async function applyRefinedRegions(
  mappedAnswers: MappedAnswer[],
  mimeType: string,
  base64Data: string,
  singleQuestionId?: string
): Promise<MappedAnswer[]> {
  const targets = mappedAnswers.filter(
    (answer) =>
      answer.status !== "unanswered" &&
      answer.answerText &&
      (!singleQuestionId || answer.questionId === singleQuestionId)
  );

  if (targets.length === 0) return mappedAnswers;

  const prompt = buildRefineRegionsPrompt(mappedAnswers, singleQuestionId);
  const text = await callGeminiWithFile(mimeType, base64Data, prompt);
  const parsed = parseJsonResponse<{
    regions: {
      questionId?: string;
      questionNumber?: string;
      subQuestionLabel?: string | null;
      boundingBox?: unknown;
      pageNumber?: number;
    }[];
  }>(text);

  const regionMap = new Map<string, { boundingBox: BoundingBox; pageNumber?: number }>();

  for (const region of parsed.regions || []) {
    const boundingBox = normalizeBoundingBox(region.boundingBox);
    if (!boundingBox || !isValidBoundingBox(boundingBox)) continue;

    const padded = padBoundingBox(boundingBox, 0.3);
    const pageNumber =
      region.pageNumber && region.pageNumber > 0 ? region.pageNumber : 1;

    if (region.questionId) {
      regionMap.set(region.questionId, { boundingBox: padded, pageNumber });
      continue;
    }

    if (region.questionNumber) {
      const key = buildRegionLookupKey(
        region.questionNumber,
        region.subQuestionLabel
      );
      regionMap.set(key, { boundingBox: padded, pageNumber });
    }
  }

  return mappedAnswers.map((answer) => {
    const byId = regionMap.get(answer.questionId);
    const byKey = regionMap.get(
      buildRegionLookupKey(answer.questionNumber, answer.subQuestionLabel)
    );
    const refined = byId || byKey;

    if (!refined) return answer;

    return {
      ...answer,
      boundingBox: refined.boundingBox,
      pageNumber: refined.pageNumber ?? answer.pageNumber ?? 1,
    };
  });
}

export async function refineAnswerBoundingBoxes(
  mimeType: string,
  base64Data: string,
  mappedAnswers: MappedAnswer[]
): Promise<MappedAnswer[]> {
  try {
    return await applyRefinedRegions(mappedAnswers, mimeType, base64Data);
  } catch {
    return mappedAnswers;
  }
}

export async function refineSingleAnswerRegion(
  mimeType: string,
  base64Data: string,
  mappedAnswers: MappedAnswer[],
  questionId: string
): Promise<MappedAnswer | null> {
  const target = mappedAnswers.find((answer) => answer.questionId === questionId);
  if (!target || target.status === "unanswered" || !target.answerText) {
    return null;
  }

  try {
    const updated = await applyRefinedRegions(
      mappedAnswers,
      mimeType,
      base64Data,
      questionId
    );
    return updated.find((answer) => answer.questionId === questionId) ?? null;
  } catch {
    return null;
  }
}

export async function generateAiFeedback(
  mappedAnswers: MappedAnswer[]
): Promise<MappedAnswer[]> {
  if (mappedAnswers.length === 0) return mappedAnswers;

  const payload = mappedAnswers.map((answer) => ({
    questionId: answer.questionId,
    question: answer.questionText,
    answer: answer.answerText,
    status: answer.status,
    confidence: answer.confidence,
  }));

  const prompt = `You are an experienced teacher reviewing student exam answers. For each item below, write 1-2 sentences of warm, constructive feedback specific to that question and answer.

Guidelines:
- Praise correct, clear answers enthusiastically
- For missing answers, encourage attempting the question
- For partial or unclear answers, suggest what to improve
- Reference the actual answer content when available
- Do NOT repeat the question text verbatim

Return ONLY valid JSON (no markdown):
{
  "items": [
    { "questionId": "q1", "feedback": "Excellent work! ..." }
  ]
}

Items:
${JSON.stringify(payload)}`;

  try {
    const text = await callGeminiText(prompt);
    const parsed = parseJsonResponse<{
      items: { questionId: string; feedback: string }[];
    }>(text);

    const feedbackMap = new Map(
      (parsed.items || []).map((item) => [item.questionId, item.feedback])
    );

    return mappedAnswers.map((answer) => ({
      ...answer,
      aiFeedback:
        feedbackMap.get(answer.questionId)?.trim() || buildFeedback(answer),
    }));
  } catch {
    return mappedAnswers.map((answer) => ({
      ...answer,
      aiFeedback: buildFeedback(answer),
    }));
  }
}

function findFuzzyAnswer(
  answerMap: Map<string, ExtractedAnswer>,
  questionNumber: string
): ExtractedAnswer | undefined {
  for (const [key, answer] of answerMap.entries()) {
    if (key.startsWith(`${questionNumber}:`)) {
      return answer;
    }
  }
  return undefined;
}

function createMappedAnswer(
  question: ExtractedQuestion,
  displayText: string,
  subLabel: string | undefined,
  answer: ExtractedAnswer | undefined
): MappedAnswer {
  if (!answer || !answer.answerText?.trim()) {
    return {
      questionId: subLabel ? `${question.id}-${subLabel}` : question.id,
      questionNumber: subLabel ? `${question.number}(${subLabel})` : question.number,
      questionText: displayText,
      subQuestionLabel: subLabel,
      answerText: null,
      status: "unanswered",
      pageNumber: answer?.pageNumber,
    };
  }

  if (answer.isUnreadable) {
    return {
      questionId: subLabel ? `${question.id}-${subLabel}` : question.id,
      questionNumber: subLabel ? `${question.number}(${subLabel})` : question.number,
      questionText: displayText,
      subQuestionLabel: subLabel,
      answerText: answer.answerText,
      status: "unreadable",
      confidence: answer.confidence,
      boundingBox: normalizeBoundingBox(answer.boundingBox),
      pageNumber: answer.pageNumber,
    };
  }

  return {
    questionId: subLabel ? `${question.id}-${subLabel}` : question.id,
    questionNumber: subLabel ? `${question.number}(${subLabel})` : question.number,
    questionText: displayText,
    subQuestionLabel: subLabel,
    answerText: answer.answerText,
    status: "answered",
    confidence: answer.confidence,
    boundingBox: normalizeBoundingBox(answer.boundingBox),
    pageNumber: answer.pageNumber,
  };
}

export function computeStats(mappedAnswers: MappedAnswer[]) {
  return {
    totalQuestions: mappedAnswers.length,
    answered: mappedAnswers.filter((a) => a.status === "answered").length,
    unanswered: mappedAnswers.filter((a) => a.status === "unanswered").length,
    partial: mappedAnswers.filter(
      (a) => a.status === "partial" || a.status === "unreadable"
    ).length,
  };
}
