import { z } from 'zod';
import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendReportMail } from '../utils/mailer.js';

const reportSchema = z.object({
  senderName:  z.string().min(2).max(120),
  senderEmail: z.string().email(),
  against:     z.string().min(2).max(200),
  reason:      z.string().min(10).max(5000)
});

export const createReport = catchAsync(async (req, res) => {
  const data = reportSchema.parse(req.body);

  // Always store in DB
  await prisma.report.create({
    data: {
      ...data,
      userId: req.user?.id ?? null
    }
  });

  // Attempt email — non-blocking, failure doesn't break the request
  let mailed = false;
  try {
    mailed = await sendReportMail(data);
  } catch (e) {
    console.error('[report] E-Mail konnte nicht gesendet werden:', e.message);
  }

  res.status(201).json({
    message: 'Meldung eingegangen. Vielen Dank.',
    mailed
  });
});
