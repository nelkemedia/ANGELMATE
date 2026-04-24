import { z } from 'zod';
import { catchAsync } from '../utils/catch-async.js';
import { calculateBiteIndex } from '../services/forecast.service.js';

const querySchema = z.object({
  temperature: z.coerce.number(),
  pressure: z.coerce.number(),
  windSpeed: z.coerce.number(),
  cloudCover: z.coerce.number()
});

export const getTodayForecast = catchAsync(async (req, res) => {
  const data = querySchema.parse(req.query);
  const hour = new Date().getHours();

  const forecast = calculateBiteIndex({ ...data, hour });

  res.json({
    input: data,
    currentHour: hour,
    biteIndex: forecast.score,
    level: forecast.level,
    recommendation: forecast.recommendation,
    bestTimeWindow: hour < 12 ? '05:30-08:30, 18:00-20:30' : '18:00-20:30, morgen 05:30-08:30'
  });
});
