import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

// ── Reports ──────────────────────────────────────────────────────────────────

export const getReports = catchAsync(async (_req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });
  res.json({ reports });
});

export const resolveReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new AppError('Report not found', 404);

  const updated = await prisma.report.update({
    where: { id },
    data: {
      resolved:   !report.resolved,
      resolvedAt: !report.resolved ? new Date() : null
    }
  });
  res.json({ report: updated });
});

export const deleteReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.report.delete({ where: { id } }).catch(() => {
    throw new AppError('Report not found', 404);
  });
  res.status(204).end();
});

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = catchAsync(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      skillLevel: true, homeRegion: true, createdAt: true,
      userStatus: { select: { status: true } },
      _count: { select: { catches: true, spots: true, comments: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Auto-create ACTIVE status for users without a UserStatus entry
  const missing = users.filter((u) => !u.userStatus).map((u) => ({ userId: u.id, status: 'ACTIVE' }));
  if (missing.length > 0) {
    await prisma.userStatus.createMany({ data: missing, skipDuplicates: true });
    for (const u of users) {
      if (!u.userStatus) u.userStatus = { status: 'ACTIVE' };
    }
  }

  res.json({ users });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) throw new AppError('Du kannst dein eigenes Konto nicht löschen.', 400);

  await prisma.user.delete({ where: { id } }).catch(() => {
    throw new AppError('User not found', 404);
  });
  res.status(204).end();
});

export const setUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (id === req.user.id) throw new AppError('Du kannst deinen eigenen Status nicht ändern.', 400);
  if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new AppError('Ungültiger Status. Erlaubt: ACTIVE, INACTIVE', 400);

  await prisma.userStatus.upsert({
    where:  { userId: id },
    update: { status },
    create: { userId: id, status }
  });

  res.json({ userId: id, status });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user.id) throw new AppError('Du kannst deine eigene Rolle nicht ändern.', 400);
  if (!['ADMIN', 'USER'].includes(role)) throw new AppError('Ungültige Rolle. Erlaubt: ADMIN, USER', 400);

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  }).catch(() => { throw new AppError('Nutzer nicht gefunden.', 404); });

  res.json({ user });
});
