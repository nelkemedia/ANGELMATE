import { z } from 'zod';
import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

const advertiserSchema = z.object({
  name:         z.string().min(1).max(100),
  contactEmail: z.string().email(),
  logoBase64:   z.string().optional().nullable()
});

const adSchema = z.object({
  advertiserId: z.number().int().positive(),
  format:       z.enum(['BANNER', 'CARD']),
  position:     z.enum(['FEED', 'DASHBOARD']),
  imageBase64:  z.string().min(1),
  linkUrl:      z.string().url(),
  title:        z.string().max(100).optional().nullable(),
  description:  z.string().max(300).optional().nullable(),
  isActive:     z.boolean().optional(),
  startsAt:     z.string().datetime().optional().nullable(),
  endsAt:       z.string().datetime().optional().nullable(),
  priority:     z.number().int().min(0).max(100).optional()
});

// ── Public ────────────────────────────────────────────────────────────────────

export const getCurrentAd = catchAsync(async (req, res) => {
  const { position } = req.query;
  if (!position || !['FEED', 'DASHBOARD'].includes(position)) {
    throw new AppError('Invalid position', 400, 'INVALID_POSITION');
  }

  const now = new Date();
  const ad = await prisma.ad.findFirst({
    where: {
      position,
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true, format: true, imageBase64: true,
      linkUrl: true, title: true, description: true
    }
  });

  res.json({ ad });
});

export const trackClick = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.ad.update({ where: { id }, data: { clickCount: { increment: 1 } } }).catch(() => {});
  res.status(204).end();
});

export const trackImpression = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.ad.update({ where: { id }, data: { impressionCount: { increment: 1 } } }).catch(() => {});
  res.status(204).end();
});

// ── Admin: Advertisers ────────────────────────────────────────────────────────

export const getAdvertisers = catchAsync(async (_req, res) => {
  const advertisers = await prisma.advertiser.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ads: true } } }
  });
  res.json({ advertisers });
});

export const createAdvertiser = catchAsync(async (req, res) => {
  const data = advertiserSchema.parse(req.body);
  const advertiser = await prisma.advertiser.create({ data });
  res.status(201).json({ advertiser });
});

export const updateAdvertiser = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = advertiserSchema.partial().parse(req.body);
  const advertiser = await prisma.advertiser.update({ where: { id }, data }).catch(() => {
    throw new AppError('Advertiser not found', 404);
  });
  res.json({ advertiser });
});

export const deleteAdvertiser = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.advertiser.delete({ where: { id } }).catch(() => {
    throw new AppError('Advertiser not found', 404);
  });
  res.status(204).end();
});

// ── Admin: Ads ────────────────────────────────────────────────────────────────

export const getAds = catchAsync(async (req, res) => {
  const { position, advertiserId, isActive } = req.query;
  const where = {};
  if (position)     where.position     = position;
  if (advertiserId) where.advertiserId = parseInt(advertiserId);
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const ads = await prisma.ad.findMany({
    where,
    orderBy: [{ position: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    include: { advertiser: { select: { id: true, name: true } } }
  });
  res.json({ ads });
});

export const createAd = catchAsync(async (req, res) => {
  const data = adSchema.parse(req.body);
  const ad = await prisma.ad.create({
    data: {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt:   data.endsAt   ? new Date(data.endsAt)   : null
    },
    include: { advertiser: { select: { id: true, name: true } } }
  });
  res.status(201).json({ ad });
});

export const updateAd = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = adSchema.partial().parse(req.body);
  const ad = await prisma.ad.update({
    where: { id },
    data: {
      ...data,
      startsAt: data.startsAt !== undefined ? (data.startsAt ? new Date(data.startsAt) : null) : undefined,
      endsAt:   data.endsAt   !== undefined ? (data.endsAt   ? new Date(data.endsAt)   : null) : undefined
    },
    include: { advertiser: { select: { id: true, name: true } } }
  }).catch(() => { throw new AppError('Ad not found', 404); });
  res.json({ ad });
});

export const deleteAd = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.ad.delete({ where: { id } }).catch(() => {
    throw new AppError('Ad not found', 404);
  });
  res.status(204).end();
});
