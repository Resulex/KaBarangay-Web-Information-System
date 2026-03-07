import jwt from 'jsonwebtoken';
import { HttpError } from '../middleware/errorHandler.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError('No authentication token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store decoded user info for later use
    next();
  } catch (err) {
    next(new HttpError('Invalid or expired token.', 401));
  }
};