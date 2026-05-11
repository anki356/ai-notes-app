import { PrismaClient } from './src/lib/generated/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking notes...");
  const count = await prisma.note.count();
  console.log(`Current Count: ${count}`);
  
  console.log("Creating a test note...");
  const note = await prisma.note.create({
    data: {
      title: "Supabase Test Note",
      content: "This note confirms that the application is successfully connected to Supabase and can persist data.",
    }
  });
  console.log("Note created successfully! ID:", note.id);
  
  const newCount = await prisma.note.count();
  console.log(`New Count: ${newCount}`);
}

main()
  .catch(e => {
    console.error("FAILED to connect or create note:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
