import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';

const catchSchema = z.object({
  fishSpecies: z.string().min(2).max(80),
  weight: z.number().positive().max(200).nullable().optional(),
  length: z.number().positive().max(300).nullable().optional(),
  caughtAt: z.string().datetime(),
  waterName: z.string().min(2).max(120),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  bait: z.string().max(80).optional().or(z.literal('')),
  technique: z.string().max(80).optional().or(z.literal('')),
  weatherSnapshot: z.any().optional(),
  imageUrl: z.string().max(2097152).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  isPublic: z.boolean().optional()
});

export const getAllCatches = catchAsync(async (req, res) => {
  const catches = await prisma.catch.findMany({
    where: { userId: req.user.id },
    orderBy: { caughtAt: 'desc' }
  });

  res.json({ items: catches });
});

export const createCatch = catchAsync(async (req, res) => {
  const data = catchSchema.parse(req.body);

  const created = await prisma.catch.create({
    data: {
      ...data,
      bait: data.bait || null,
      technique: data.technique || null,
      imageUrl: data.imageUrl || null,
      notes: data.notes || null,
      userId: req.user.id,
      caughtAt: new Date(data.caughtAt)
    }
  });

  res.status(201).json(created);
});

export const getCatchById = catchAsync(async (req, res) => {
  const item = await prisma.catch.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!item) throw new AppError('Catch not found', 404);
  res.json(item);
});

export const updateCatch = catchAsync(async (req, res) => {
  const data = catchSchema.partial().parse(req.body);

  const existing = await prisma.catch.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!existing) throw new AppError('Catch not found', 404);

  const updated = await prisma.catch.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.caughtAt ? { caughtAt: new Date(data.caughtAt) } : {})
    }
  });

  res.json(updated);
});

export const deleteCatch = catchAsync(async (req, res) => {
  const existing = await prisma.catch.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!existing) throw new AppError('Catch not found', 404);

  await prisma.catch.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
