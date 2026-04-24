import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'max@example.com' },
    update: {},
    create: {
      name: 'Max Angler',
      email: 'max@example.com',
      passwordHash,
      homeRegion: 'Berlin/Brandenburg',
      skillLevel: 'intermediate'
    }
  });

  await prisma.catch.createMany({
    data: [
      {
        userId: user.id,
        fishSpecies: 'Hecht',
        weight: 4.8,
        length: 78,
        caughtAt: new Date('2026-04-10T06:45:00Z'),
        waterName: 'Müggelsee',
        bait: 'Gummifisch',
        technique: 'Spinnfischen',
        notes: 'Morgens an der Schilfkante.'
      },
      {
        userId: user.id,
        fishSpecies: 'Barsch',
        weight: 1.1,
        length: 39,
        caughtAt: new Date('2026-04-15T18:20:00Z'),
        waterName: 'Dahme',
        bait: 'Spinner',
        technique: 'Uferangeln',
        notes: 'Abends bei leichtem Wind.'
      }
    ],
    skipDuplicates: true
  });

  await prisma.spot.createMany({
    data: [
      {
        userId: user.id,
        title: 'Schilfkante Ost',
        description: 'Guter Morgen-Spot für Raubfisch.',
        latitude: 52.439,
        longitude: 13.647,
        visibility: 'private',
        targetSpecies: ['Hecht', 'Barsch']
      },
      {
        userId: user.id,
        title: 'Hafeneinfahrt',
        description: 'Öffentlicher Spot mit guter Abendaktivität.',
        latitude: 52.41,
        longitude: 13.67,
        visibility: 'public',
        targetSpecies: ['Barsch']
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
