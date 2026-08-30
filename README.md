# VedaAI Assessment Extraction

AI-powered tool to extract and map student answers from handwritten answer sheets against question papers. Built for the [VedaAI Hiring Assignment](https://www.figma.com/design/GEjt1rt1s7AXvkcr4t8muE/VedaAI-Hiring-Assignment).

## Live Demo

> Deploy to Vercel and add your live URL here after deployment.

## Features

- **Dual file upload** — Question paper + answer sheet (PDF, JPG, PNG up to 10MB)
- **AI extraction** — Google Gemini 2.0 Flash reads both documents
- **Smart mapping** — Matches answers to questions, handles out-of-order responses and sub-questions
- **Results dashboard** — Split view with answer sheet highlighting and extracted answer list
- **Edge case handling** — Unanswered, unreadable, and partial answers are clearly marked
- **Responsive design** — Matches Figma design on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| AI | Google Gemini 2.0 Flash (free tier) |
| Storage | In-memory (no database) |
| Deployment | Vercel |

## Setup

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier)

### Installation

```powershell
# Clone the repository
git clone <your-repo-url>
cd vedaai-assessment-extraction

# Install dependencies
npm install

# Configure environment
Copy-Item .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |

## Approach

### 1. Upload Flow

Users upload a question paper and answer sheet via drag-and-drop or file picker. Client-side validation checks file type (PDF/JPG/PNG) and size (max 10MB) before submission.

### 2. Extraction Pipeline

Two parallel Gemini API calls process the documents:

1. **Question extraction** — Parses the question paper into structured JSON with question numbers, text, types, marks, and sub-questions.
2. **Answer extraction** — Reads the answer sheet, extracts answers with question number references, confidence levels, and bounding box coordinates (for highlighting).

### 3. Answer Mapping

A deterministic mapping layer matches extracted answers to questions:

- Normalizes question numbers (strips "Q" prefix, handles sub-parts like "3a")
- Maps by `questionNumber:subLabel` key
- Marks missing answers as "unanswered"
- Flags illegible handwriting as "unreadable"

### 4. Results Display

Split-view interface showing:

- **Left panel** — Answer sheet with colored bounding boxes around detected answers
- **Right panel** — Scrollable list of questions with extracted answers, status badges, and copy-to-clipboard

## API Used

**Google Gemini 2.0 Flash** — Free tier via `@google/generative-ai` SDK.

- Multimodal input (images + PDFs)
- Structured JSON output via prompt engineering
- No paid APIs required

## Assumptions & Limitations

| Assumption | Detail |
|-----------|--------|
| Single answer sheet | One student answer sheet per extraction session |
| English content | Optimized for English question papers and answers |
| Clear numbering | Questions and answers use standard numbering (1, 2, 3a, etc.) |
| In-memory storage | Sessions expire after 1 hour; data is lost on server restart |
| No authentication | Open access for demo purposes |
| Bounding boxes | Approximate positions estimated by Gemini; may not be pixel-perfect |
| PDF support | PDFs are sent directly to Gemini; complex multi-page layouts may vary in accuracy |

## Testing

| Test Case | Expected Behavior |
|-----------|-------------------|
| Valid question paper + answer sheet | Correct extraction and mapping |
| Out-of-order answers | Answers mapped by question number, not position |
| Missing answers | Marked as "Unanswered" |
| Sub-questions (e.g., Q1a, Q1b) | Separated and mapped individually |
| Low-quality images | Graceful handling with "Unreadable" status |
| Large files (>10MB) | Rejected with clear error message |
| Mobile view | Responsive stacked layout |
| Error states | Helpful error messages displayed |

## Deployment (Vercel)

1. Push code to a public GitHub repository
2. Import the repo in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` in Environment Variables
4. Deploy and verify the live URL

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── extract/route.ts      # POST — upload & extract
│   │   └── session/[id]/route.ts # GET — fetch results
│   ├── results/[id]/page.tsx     # Results page
│   ├── page.tsx                  # Upload page
│   └── layout.tsx
├── components/
│   ├── layout/                   # Sidebar, Header, DashboardLayout
│   ├── upload/                   # UploadCard, ProcessingOverlay
│   └── results/                  # QuestionList, AnswerSheetViewer
└── lib/
    ├── gemini.ts                 # AI extraction & mapping logic
    ├── storage.ts                # In-memory session store
    ├── types.ts                  # TypeScript interfaces
    └── validation.ts             # File validation helpers
```

## License

MIT
