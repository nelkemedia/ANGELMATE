import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';
import { signToken } from '../utils/jwt.js';
import { sendPasswordResetMail } from '../utils/mailer.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  homeRegion: z.string().max(120).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const register = catchAsync(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      homeRegion: data.homeRegion,
      skillLevel: data.skillLevel || 'beginner'
    },
    select: {
      id: true, name: true, email: true,
      homeRegion: true, skillLevel: true, createdAt: true, avatarBase64: true, role: true
    }
  });

  const token = signToken({ userId: user.id });
  res.status(201).json({ user, token });
});

export const login = catchAsync(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { userStatus: { select: { status: true } } }
  });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.userStatus?.status === 'INACTIVE') {
    throw new AppError('Dein Konto wurde deaktiviert. Bitte wende dich an den Administrator.', 403);
  }

  const token = signToken({ userId: user.id });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      homeRegion: user.homeRegion,
      skillLevel: user.skillLevel,
      createdAt: user.createdAt,
      avatarBase64: user.avatarBase64,
      role:         user.role
    }
  });
});

export const me = catchAsync(async (req, res) => {
  res.json({ user: req.user });
});

const USER_SELECT = { id: true, name: true, email: true, homeRegion: true, skillLevel: true, createdAt: true, avatarBase64: true, role: true };

const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  homeRegion: z.string().max(120).nullable().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  avatarBase64: z.string().nullable().optional()
});

export const updateProfile = catchAsync(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: USER_SELECT
  });

  res.json({ user });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const userWithHash = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, userWithHash.passwordHash);
  if (!valid) throw new AppError('Aktuelles Passwort ist falsch.', 401);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

  res.json({ message: 'Passwort erfolgreich geändert.' });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const ok = { message: 'Falls die E-Mail-Adresse registriert ist, wurde eine E-Mail gesendet.' };

  const user = await prisma.user.findUnique({ where: { email: String(email || '') } });
  if (!user) return res.json(ok); // no enumeration

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token     = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 h

  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const base      = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const resetLink = `${base}/reset-password?token=${token}`;

  await sendPasswordResetMail({ to: user.email, name: user.name, resetLink });
  res.json(ok);
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8)
    throw new AppError('Ungültige Anfrage.', 400);

  const tokenHash  = crypto.createHash('sha256').update(token).digest('hex');
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!resetToken || resetToken.expiresAt < new Date())
    throw new AppError('Der Link ist ungültig oder abgelaufen.', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { tokenHash } });

  res.json({ message: 'Passwort erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.' });
});
