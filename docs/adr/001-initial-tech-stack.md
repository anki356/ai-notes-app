# ADR 001: Initial Tech Stack Selection

## Status
Proposed

## Context
We need a tech stack that supports:
1. Fast Markdown rendering.
2. Local vector storage for semantic search.
3. Potential for local AI execution.
4. Modern, premium UI/UX.

## Decision
- **Framework:** Next.js (App Router) for its robust routing and server/client component balance.
- **Editor:** Lexical or TipTap for a highly customizable Markdown experience.
- **Database:** PostgreSQL (Supabase) for structured metadata and LanceDB for local vector storage. PostgreSQL provides better scalability and remote access for multi-device sync in the future.
- **Styling:** Tailwind CSS for rapid, consistent UI development.
- **AI:** Start with Gemini API for summarization (due to ease of use) but architect for Ollama/local-only fallback.

## Consequences
- **Positive:** Fast development, great UX, privacy-ready.
- **Negative:** Requires careful management of local binary dependencies (LanceDB).
