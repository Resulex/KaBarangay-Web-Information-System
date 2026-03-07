import { body, param, validationResult } from 'express-validator';
import { HttpError } from '../middleware/errorHandler.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    // Pass to the centralized error handler as a 400 Bad Request
    return next(new HttpError('Validation failed', 400, formattedErrors));
  }
  next();
};


// Validation for Admin Login
export const loginAdminValidation = [
  body('username').trim().notEmpty().withMessage('Username is required for login.'),
  body('password').notEmpty().withMessage('Password is required for login.'),
  handleValidationErrors,
];