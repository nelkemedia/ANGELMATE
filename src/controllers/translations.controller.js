import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

const SUPPORTED = ['de', 'en', 'fr'];

export const getTranslations = catchAsync(async (req, res) => {
  const locale = SUPPORTED.includes(req.query.locale) ? req.query.locale : 'de';
  const rows = await prisma.translation.findMany({ where: { locale } });
  const translations = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ locale, translations });
});

export const getAllTranslations = catchAsync(async (_req, res) => {
  const rows = await prisma.translation.findMany({ orderBy: [{ key: 'asc' }, { locale: 'asc' }] });
  const grouped = {};
  for (const r of rows) {
    grouped[r.key] ??= {};
    grouped[r.key][r.locale] = r.value;
  }
  res.json({ translations: grouped });
});

export const upsertTranslation = catchAsync(async (req, res) => {
  const { key, translations } = req.body;
  if (!key || typeof key !== 'string') throw new AppError('key is required', 400);
  if (!translations || typeof translations !== 'object') throw new AppError('translations object is required', 400);

  for (const [locale, value] of Object.entries(translations)) {
    if (!SUPPORTED.includes(locale)) continue;
    await prisma.translation.upsert({
      where: { locale_key: { locale, key } },
      update: { value: String(value) },
      create: { locale, key, value: String(value) }
    });
  }
  res.json({ ok: true });
});

export const deleteTranslation = catchAsync(async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  await prisma.translation.deleteMany({ where: { key } });
  res.status(204).end();
});
