import { AppError } from '../utils/app-error.js';

export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (req.user.role !== 'ADMIN') return next(new AppError('Forbidden', 403));
  next();
};
