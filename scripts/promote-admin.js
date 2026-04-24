// Usage: node scripts/promote-admin.js <email>
// Promotes a user to ADMIN role.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email  = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>');
  process.exit(1);
}

const user = await prisma.user.update({
  where: { email },
  data:  { role: 'ADMIN' },
  select: { id: true, name: true, email: true, role: true }
}).catch((e) => {
  console.error(`Fehler: Nutzer "${email}" nicht gefunden oder DB-Fehler.`);
  console.error(e.message);
  process.exit(1);
});

console.log(`✅ ${user.name} (${user.email}) ist jetzt ${user.role}.`);
await prisma.$disconnect();
