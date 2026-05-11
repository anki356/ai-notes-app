import { PrismaClient } from "./src/lib/generated/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

async function test() {
  const dbPath = path.join(process.cwd(), "dev.db");
  const connectionString = `file:${dbPath}`;
  
  const adapter = new PrismaBetterSqlite3({
    url: connectionString
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Testing Prisma 7 Connection with Adapter...");
    const notesCount = await prisma.note.count();
    console.log(`Notes count: ${notesCount}`);
    
    const newNote = await prisma.note.create({
      data: {
        title: "Final Verification",
        content: "Everything is working!",
      }
    });
    console.log("Created test note:", newNote.id);
  } catch (err) {
    console.error("Prisma test failed:", err);
  }
}

test();
