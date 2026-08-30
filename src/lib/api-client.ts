export async function parseApiJson<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.includes("Server Action") || text.startsWith("Server")) {
      throw new Error(
        "The dev server needs a refresh. Stop it, delete the .next folder, and run npm run dev again."
      );
    }

    throw new Error(
      "Unexpected server response. Please refresh the page and try again."
    );
  }
}
