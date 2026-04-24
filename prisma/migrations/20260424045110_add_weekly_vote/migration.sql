-- CreateTable
CREATE TABLE "WeeklyVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "week" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeeklyVote_catchId_fkey" FOREIGN KEY ("catchId") REFERENCES "Catch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WeeklyVote_week_idx" ON "WeeklyVote"("week");

-- CreateIndex
CREATE INDEX "WeeklyVote_catchId_week_idx" ON "WeeklyVote"("catchId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyVote_userId_week_key" ON "WeeklyVote"("userId", "week");
