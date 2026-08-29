import { MappedAnswer } from "./types";

function truncate(text: string, max = 100): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export function buildFeedback(answer: MappedAnswer): string {
  const excerpt = answer.answerText ? `"${truncate(answer.answerText, 90)}"` : "";

  if (answer.status === "unanswered") {
    return "No answer was detected for this question. Encourage the student to attempt every question — even a partial response helps identify what they understand.";
  }

  if (answer.status === "unreadable") {
    return "An answer was detected but the handwriting is difficult to read. Ask the student to write more clearly so their work can be assessed accurately.";
  }

  if (answer.status === "partial") {
    return `The response ${excerpt} shows partial understanding. Review the key concepts for this topic and encourage the student to elaborate with more detail.`;
  }

  if (answer.confidence === "high") {
    return `Excellent work! The answer ${excerpt} demonstrates a clear understanding of the concept. Keep it up!`;
  }

  if (answer.confidence === "medium") {
    return `Good effort. The answer ${excerpt} is on the right track but could be more complete. A quick review of this topic would strengthen the response.`;
  }

  return `The answer ${excerpt} was captured but may need verification. Consider reviewing this response with the student to confirm accuracy.`;
}
