# Implementation Plan - Semantic Search with pgvector

Implement semantic search using Supabase pgvector and Gemini embeddings. This will allow users to search for notes by meaning, not just exact keywords.

## User Review Required

> [!IMPORTANT]
> This feature requires the `vector` extension to be enabled in your Supabase database. I have already included this in the schema, but if it fails, you may need to run `CREATE EXTENSION IF NOT EXISTS vector;` in your Supabase SQL Editor.

## Proposed Changes

### Database Layer

#### [MODIFY] [schema.prisma](file:///d:/ai-notes-app/prisma/schema.prisma)
- Add `embedding Unsupported("vector(768)")?` to the `Note` model. (Already done)
- Enable `pgvector` extension. (Already done)

### AI Service Layer

#### [MODIFY] [ai.ts](file:///d:/ai-notes-app/src/lib/ai.ts)
- Add `generateEmbedding(text: string)` using `GoogleGenerativeAI`.
- Model: `text-embedding-004`.

### Server Actions Layer

#### [MODIFY] [actions.ts](file:///d:/ai-notes-app/src/lib/actions.ts)
- Add `searchNotes(query: string)` action.
- Use `prisma.$queryRaw` to perform vector similarity search using `<=>` (cosine distance).
- Update `createNote` and `updateNote` to automatically generate/update embeddings when content changes.

### UI Layer

#### [MODIFY] [library/page.tsx](file:///d:/ai-notes-app/src/app/library/page.tsx)
- Add state for search query.
- Trigger `searchNotes` on input change (with debounce).
- Display results dynamically.

## Verification Plan

### Automated Tests
- N/A (Manual verification via UI)

### Manual Verification
1. Create a note about "Cooking pasta".
2. Search for "How to make Italian food".
3. Verify the "Cooking pasta" note appears in results even if it doesn't contain the word "Italian".
