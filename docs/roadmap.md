# Technical Roadmap: AI Notes App

## Milestone 1: Foundation (POC)
**Goal:** Establish the basic Markdown editor and cloud storage.
- **Scope:**
    - Basic Markdown editor with preview mode.
    - Cloud-based storage (Supabase PostgreSQL).
    - Project structure setup (Git, Folders).
- **Functional Requirements:** Create, edit, save, and delete notes.
- **Non-Functional Requirements:** Responsiveness, < 50ms save latency.
- **Tests:** Unit tests for database connectivity and Markdown parsing.
- **Status:** [Completed] - Migrated to Supabase

## Milestone 2: Intelligent Search & Summaries (MVP)
**Goal:** Integrate local embeddings and AI summarization.
- **Scope:**
    - Local vector database (e.g., LanceDB or similar).
    - Semantic search implementation.
    - AI Summarization (via local LLM or secure API like Gemini/Ollama).
- **Functional Requirements:** Search by meaning (not just keywords), one-click summaries.
- **Non-Functional Requirements:** Search results in < 300ms.
- **Tests:** Integration tests for embedding generation and search retrieval.
- **Status:** [Completed] - AI Summarization and Semantic Search via pgvector Implemented

## Milestone 3: Voice & Multimedia
**Goal:** Add voice notes and transcription.
- **Scope:**
    - Voice recording interface.
    - Local/Cloud transcription (Whisper/Web Speech API).
    - Multimedia attachment support.
- **Functional Requirements:** Record audio, view transcript, link transcript to note.
- **Tests:** E2E tests for recording flow.
- **Status:** [Completed] - Native Web Speech API Integrated

## Milestone 4: Target Maturity
**Goal:** Refined UI, Sync, and Advanced Analytics.
- **Scope:**
    - Graph visualization of note connections.
    - Optional cloud sync with E2E encryption.
    - Mobile-responsive design/PWA.
- **Status:** [In Progress] - Graph visualization skeleton fixed, pending dependency installation.
