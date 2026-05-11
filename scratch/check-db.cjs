const { PrismaClient } = require("../src/lib/generated");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.note.count();
  console.log(`Total Notes: ${count}`);
  const notes = await prisma.note.findMany({ take: 5 });
  console.log("Sample Notes:", JSON.stringify(notes, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
