import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { verifyToken } from '../utils/jwt.js';

export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, homeRegion: true, skillLevel: true, createdAt: true, avatarBase64: true, role: true }
    });
    if (user) req.user = user;
  } catch { /* ignore */ }
  next();
};

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        homeRegion: true,
        skillLevel: true,
        createdAt: true,
        avatarBase64: true,
        role: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};
