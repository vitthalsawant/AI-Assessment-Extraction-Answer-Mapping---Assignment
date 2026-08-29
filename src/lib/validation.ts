export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

export function validateFile(file: File): string | null {
  if (!file) {
    return "No file provided.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds the 10MB size limit (${formatFileSize(file.size)}).`;
  }

  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
      return `File "${file.name}" has an unsupported format. Please upload PDF, JPG, or PNG.`;
    }
  }

  if (file.size === 0) {
    return `File "${file.name}" is empty.`;
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFileSizeCompact(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  const mb = bytes / (1024 * 1024);
  const rounded = Math.round(mb * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}MB` : `${rounded}MB`;
}

export async function getFilePageCount(file: File): Promise<number> {
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) return 1;

  try {
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder("latin1").decode(new Uint8Array(buffer));

    const countMatch = text.match(/\/Count\s+(\d+)/);
    if (countMatch) {
      const count = Number.parseInt(countMatch[1], 10);
      if (count > 0 && count < 10_000) return count;
    }

    const pageMatches = text.match(/\/Type\s*\/Page(?!s)/g);
    return pageMatches?.length || 1;
  } catch {
    return 1;
  }
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function getMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
