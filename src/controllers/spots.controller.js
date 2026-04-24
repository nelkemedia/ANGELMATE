import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';

const spotSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  visibility: z.enum(['private', 'public']).optional(),
  targetSpecies: z.array(z.string().min(2).max(50)).optional()
});

function deserialize(spot) {
  if (!spot) return spot;
  return { ...spot, targetSpecies: JSON.parse(spot.targetSpecies ?? '[]') };
}

export const getAllSpots = catchAsync(async (req, res) => {
  const items = await prisma.spot.findMany({
    where: { OR: [{ userId: req.user.id }, { visibility: 'public' }] },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ items: items.map(deserialize) });
});

export const createSpot = catchAsync(async (req, res) => {
  const data = spotSchema.parse(req.body);
  const created = await prisma.spot.create({
    data: {
      title: data.title,
      description: data.description || null,
      latitude: data.latitude,
      longitude: data.longitude,
      visibility: data.visibility || 'private',
      targetSpecies: JSON.stringify(data.targetSpecies || []),
      userId: req.user.id
    }
  });
  res.status(201).json(deserialize(created));
});

export const getSpotById = catchAsync(async (req, res) => {
  const item = await prisma.spot.findFirst({
    where: { id: req.params.id, OR: [{ userId: req.user.id }, { visibility: 'public' }] }
  });
  if (!item) throw new AppError('Spot not found', 404);
  res.json(deserialize(item));
});

export const updateSpot = catchAsync(async (req, res) => {
  const data = spotSchema.partial().parse(req.body);
  const existing = await prisma.spot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError('Spot not found', 404);

  const updateData = { ...data };
  if (data.targetSpecies !== undefined) {
    updateData.targetSpecies = JSON.stringify(data.targetSpecies);
  }

  const updated = await prisma.spot.update({ where: { id: req.params.id }, data: updateData });
  res.json(deserialize(updated));
});

export const deleteSpot = catchAsync(async (req, res) => {
  const existing = await prisma.spot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError('Spot not found', 404);
  await prisma.spot.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
