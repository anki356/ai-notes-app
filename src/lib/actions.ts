"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import { summarizeText, generateEmbedding } from "./ai";
import { getSession } from "./auth-actions";

export async function createNote(data: { title: string; content: string; isVoice?: boolean }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      isVoice: data.isVoice || false,
      userId: session.userId,
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
  const session = await getSession();
  if (!session) return [];

  return await prisma.note.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNoteById(id: string) {
  const session = await getSession();
  if (!session) return null;

  return await prisma.note.findUnique({
    where: { id, userId: session.userId },
  });
}

export async function updateNote(id: string, data: { title?: string; content?: string; summary?: string }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const note = await prisma.note.update({
    where: { id, userId: session.userId },
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
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.note.delete({
    where: { id, userId: session.userId },
  });
  revalidatePath("/library");
}

export async function generateNoteSummary(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const note = await prisma.note.findUnique({ where: { id, userId: session.userId } });
  if (!note || !note.content) return null;

  const summary = await summarizeText(note.content);
  
  await prisma.note.update({
    where: { id, userId: session.userId },
    data: { summary },
  });

  revalidatePath("/library");
  revalidatePath("/");
  return summary;
}

export async function searchNotes(query: string) {
  const session = await getSession();
  if (!session) return [];

  if (!query) return getNotes();

  const embedding = await generateEmbedding(query);
  if (!embedding) {
    // Fallback to keyword search if embedding fails
    return await prisma.note.findMany({
      where: {
        userId: session.userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Vector similarity search
  const vectorStr = `[${embedding.join(",")}]`;
  const notes = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, title, content, summary, "isVoice", "createdAt", "updatedAt",
     (embedding <=> $1::vector) as distance
     FROM "Note"
     WHERE "userId" = $2
     ORDER BY distance ASC
     LIMIT 10`,
    vectorStr,
    session.userId
  );

  return notes;
}
