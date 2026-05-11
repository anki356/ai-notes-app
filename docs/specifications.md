# Technical Specifications: AI Notes App

## Components List
1.  **Markdown Editor:** Custom implementation using `react-markdown` or `Lexical`.
2.  **Vector DB Layer:** Local storage for semantic vectors (LanceDB).
3.  **Embedding Engine:** `transformers.js` for browser-side embeddings or a local sidecar.
4.  **Transcription Service:** OpenAI Whisper (Local via WebAssembly or API).
5.  **Summarization Engine:** Google Gemini Pro API (Secure) or Ollama (Local).

## Algorithms & Patterns
- **RAG (Retrieval-Augmented Generation):** Used for semantic search and contextual summaries.
- **Debounced Auto-save:** For the Markdown editor.
- **Observer Pattern:** To trigger re-indexing when notes change.
- **Repository Pattern:** For abstracting data access (File system vs Cloud Sync).

## Tooling Stack
- **Frontend & Backend:** Next.js (App Router), Tailwind CSS, Framer Motion.
- **State Management:** Zustand.
- **Database:** PostgreSQL (Supabase) for Metadata + LanceDB for Vectors.
- **Testing:** Vitest (Unit/Integration), Playwright (E2E).
- **CI/CD:** GitHub Actions.
- **Language:** TypeScript.
