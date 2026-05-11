-- Create the "Note" table in Supabase SQL Editor
CREATE TABLE "Note" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "summary" TEXT,
  "isVoice" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: In Supabase, the table name should be exactly "Note" (case sensitive)
-- or match whatever you have in your Prisma schema.
