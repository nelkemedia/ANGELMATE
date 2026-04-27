import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

export const getEmailTemplates = catchAsync(async (_req, res) => {
  const rows = await prisma.emailTemplate.findMany({ orderBy: [{ name: 'asc' }, { locale: 'asc' }] });
  const grouped = {};
  for (const r of rows) {
    grouped[r.name] ??= {};
    grouped[r.name][r.locale] = { subject: r.subject, body: r.body, updatedAt: r.updatedAt };
  }
  res.json({ templates: grouped });
});

export const upsertEmailTemplate = catchAsync(async (req, res) => {
  const { name, locale, subject, body } = req.body;
  if (!name || !locale || !subject || body === undefined)
    throw new AppError('name, locale, subject und body sind erforderlich.', 400);
  if (!['de', 'en', 'fr'].includes(locale))
    throw new AppError('locale muss de, en oder fr sein.', 400);

  const template = await prisma.emailTemplate.upsert({
    where:  { name_locale: { name, locale } },
    update: { subject, body },
    create: { name, locale, subject, body }
  });
  res.json({ template });
});

export const deleteEmailTemplate = catchAsync(async (req, res) => {
  const { name } = req.params;
  await prisma.emailTemplate.deleteMany({ where: { name } });
  res.status(204).end();
});
