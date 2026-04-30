import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { KEYS, EMAIL_TEMPLATES, SEED_USERS } from './seed-data.js';

const prisma = new PrismaClient();

async function main() {
  let userCount = 0;

  for (const userData of SEED_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash,
        homeRegion: userData.homeRegion,
        skillLevel: userData.skillLevel,
        role: userData.role || 'USER'
      }
    });
    userCount++;
  }
  console.log(`Seeded ${userCount} demo users.`);

  // Create or update userStatus for each user
  for (const userData of SEED_USERS) {
    const user = await prisma.user.findUnique({ where: { email: userData.email } });
    await prisma.userStatus.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, status: 'ACTIVE' }
    });
  }

  const rows = KEYS.flatMap((k) =>
    ['de', 'en', 'fr'].map((l) => ({ locale: l, key: k.key, value: k[l] }))
  );
  const result = await prisma.translation.createMany({ data: rows, skipDuplicates: true });
  console.log(`Seeded ${result.count} translation rows (${KEYS.length} keys × 3 locales).`);

  // Email Templates
  for (const template of EMAIL_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { name_locale: { name: template.name, locale: template.locale } },
      update: { subject: template.subject, body: template.body },
      create: template
    });
  }
  console.log('Seeded 3 email templates (new_comment_in_feed × 3 locales).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
