import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';

export const getOverviewStats = catchAsync(async (req, res) => {
  const catches = await prisma.catch.findMany({
    where: { userId: req.user.id },
    orderBy: { caughtAt: 'desc' }
  });

  const totalCatches = catches.length;
  const biggestByWeight = catches
    .filter((item) => typeof item.weight === 'number')
    .sort((a, b) => b.weight - a.weight)[0] || null;

  const biggestByLength = catches
    .filter((item) => typeof item.length === 'number')
    .sort((a, b) => b.length - a.length)[0] || null;

  const speciesCount = catches.reduce((acc, item) => {
    acc[item.fishSpecies] = (acc[item.fishSpecies] || 0) + 1;
    return acc;
  }, {});

  const favoriteSpecies = Object.entries(speciesCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  res.json({
    totalCatches,
    favoriteSpecies,
    biggestByWeight,
    biggestByLength,
    recentCatches: catches.slice(0, 5)
  });
});
