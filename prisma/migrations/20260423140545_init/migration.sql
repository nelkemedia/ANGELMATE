-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "homeRegion" TEXT,
    "skillLevel" TEXT NOT NULL DEFAULT 'beginner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Catch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishSpecies" TEXT NOT NULL,
    "weight" REAL,
    "length" REAL,
    "caughtAt" DATETIME NOT NULL,
    "waterName" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "bait" TEXT,
    "technique" TEXT,
    "weatherSnapshot" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Catch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "targetSpecies" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Spot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Catch_userId_caughtAt_idx" ON "Catch"("userId", "caughtAt");

-- CreateIndex
CREATE INDEX "Spot_userId_idx" ON "Spot"("userId");
