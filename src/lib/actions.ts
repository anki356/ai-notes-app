"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import { summarizeText, generateEmbedding } from "./ai";

export async function createNote(data: { title: string; content: string; isVoice?: boolean }) {
  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      isVoice: data.isVoice || false,
    },
  });

  // Generate and save embedding in background (optional, but here we do it for semantic search)
  const embedding = await generateEmbedding(data.content);
  if (embedding) {
    await prisma.$executeRawUnsafe(
      `UPDATE "Note" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      note.id
    );
  }

  revalidatePath("/library");
  return note;
}

export async function getNotes() {
  return await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getNoteById(id: string) {
  return await prisma.note.findUnique({
    where: { id },
  });
}

export async function updateNote(id: string, data: { title?: string; content?: string; summary?: string }) {
  const note = await prisma.note.update({
    where: { id },
    data,
  });

  if (data.content) {
    const embedding = await generateEmbedding(data.content);
    if (embedding) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Note" SET embedding = $1::vector WHERE id = $2`,
        `[${embedding.join(",")}]`,
        id
      );
    }
  }

  revalidatePath(`/library`);
  revalidatePath(`/`);
  return note;
}

export async function deleteNote(id: string) {
  await prisma.note.delete({
    where: { id },
  });
  revalidatePath("/library");
}

export async function generateNoteSummary(id: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || !note.content) return null;

  const summary = await summarizeText(note.content);
  
  await prisma.note.update({
    where: { id },
    data: { summary },
  });

  revalidatePath("/library");
  revalidatePath("/");
  return summary;
}

export async function searchNotes(query: string) {
  if (!query) return getNotes();

  const embedding = await generateEmbedding(query);
  if (!embedding) {
    // Fallback to keyword search if embedding fails
    return await prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Vector similarity search (Cosine Distance <=> is used for similarity, smaller is better)
  const vectorStr = `[${embedding.join(",")}]`;
  const notes = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, title, content, summary, "isVoice", "createdAt", "updatedAt",
     (embedding <=> $1::vector) as distance
     FROM "Note"
     ORDER BY distance ASC
     LIMIT 10`,
    vectorStr
  );

  return notes;
}
