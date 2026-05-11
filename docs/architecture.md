# Architecture Documentation: AI Notes App

## System Overview
The AI Notes App is a local-first web application designed for high performance and privacy. It utilizes a modular architecture to separate the UI, Storage, and AI Processing layers.

## Component Diagram
```mermaid
graph TD
    UI[Frontend: React/Next.js] --> Editor[Markdown Editor]
    UI --> Search[Search Interface]
    UI --> Voice[Voice Recorder]
    
    Editor --> Storage[Local File System / SQLite]
    Search --> VectorDB[Local Vector DB: LanceDB/Chroma]
    Voice --> Transcription[Transcription Engine: Whisper]
    
    Storage --> AI[AI Engine]
    AI --> Embeddings[Embedding Model]
    AI --> LLM[Summarization Model: Gemini/Ollama]
    
    Embeddings --> VectorDB
```

## Data Flow Diagram
### Note Creation & Indexing
1. User saves a Markdown note.
2. System writes note to local storage.
3. System triggers background task to generate embeddings for the new content.
4. Embeddings are stored in the Vector DB with a reference to the note ID.

### Semantic Search
1. User enters a natural language query.
2. System generates embedding for the query.
3. System performs similarity search in the Vector DB.
4. Results are ranked and displayed to the user.

## ADRs
- [ADR 001: Initial Tech Stack](adr/001-initial-tech-stack.md)
