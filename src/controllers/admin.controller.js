import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';
import { sendPasswordResetMail, testSmtpConnection } from '../utils/mailer.js';

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

export const sendUserPasswordReset = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('Nutzer nicht gefunden.', 404);

  await prisma.passwordResetToken.deleteMany({ where: { userId: id } });

  const token     = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h for admin-initiated

  await prisma.passwordResetToken.create({ data: { userId: id, tokenHash, expiresAt } });

  const base      = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const resetLink = `${base}/reset-password?token=${token}`;

  await sendPasswordResetMail({ to: user.email, name: user.name, resetLink });
  res.json({ message: `Reset-E-Mail an ${user.email} gesendet.` });
});

// ── SMTP Settings ─────────────────────────────────────────────────────────────

const MASK = '••••••••';

export const getSmtp = catchAsync(async (_req, res) => {
  const s = await prisma.smtpSettings.findFirst();
  if (!s) return res.json({ settings: null });
  res.json({ settings: { ...s, password: s.password ? MASK : '' } });
});

export const saveSmtp = catchAsync(async (req, res) => {
  const { host, port, user, password, fromName, fromAddress, secure } = req.body;

  const data = {
    host:        String(host        || ''),
    port:        parseInt(port)     || 587,
    user:        String(user        || ''),
    fromName:    String(fromName    || 'AngelMate'),
    fromAddress: String(fromAddress || ''),
    secure:      Boolean(secure)
  };
  if (password && password !== MASK) data.password = String(password);

  const existing = await prisma.smtpSettings.findFirst();
  const s = existing
    ? await prisma.smtpSettings.update({ where: { id: existing.id }, data })
    : await prisma.smtpSettings.create({ data: { ...data, password: data.password ?? '' } });

  res.json({ settings: { ...s, password: s.password ? MASK : '' } });
});

export const testSmtp = catchAsync(async (req, res) => {
  const { host, port, user, password, fromName, fromAddress, secure } = req.body;

  // Resolve masked password from DB
  let realPassword = password;
  if (!password || password === MASK) {
    const existing = await prisma.smtpSettings.findFirst();
    realPassword = existing?.password || '';
  }

  await testSmtpConnection({
    host, port, user, password: realPassword, fromName, fromAddress, secure,
    toEmail: req.user.email
  });

  res.json({ message: `Test-Mail erfolgreich an ${req.user.email} gesendet.` });
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
