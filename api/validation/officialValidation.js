import { body, query, param, validationResult } from 'express-validator';
import { HttpError } from '../middleware/errorHandler.js';

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for consistent JSON response
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

export const createOfficialValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters.'),
  body('position').trim().notEmpty().withMessage('Position is required.').isLength({ min: 3, max: 100 }).withMessage('Position must be between 3 and 100 characters.'),
  body('contact_number').trim().notEmpty().withMessage('Contact number is required.').isMobilePhone('any').withMessage('Invalid contact number format.'),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email format.'),
  body('location').trim().notEmpty().withMessage('Location is required.').isLength({ min: 3, max: 200 }).withMessage('Location must be between 5 and 200 characters.'),
  body('key_responsibility').custom((value, { req }) => {
    try {
      // Ensure it's a valid JSON array string, then parse it
      const responsibilities = JSON.parse(value);
      if (!Array.isArray(responsibilities)) {
        throw new Error('Key responsibilities must be an array.');
      }
      if (responsibilities.some(r => typeof r !== 'string' || r.trim().length === 0)) {
        throw new Error('Each key responsibility must be a non-empty string.');
      }
    } catch (e) {
      throw new Error('Key responsibilities must be a valid JSON array of strings.');
    }
    return true;
  }),
  handleValidationErrors,
];

export const updateOfficialValidation = [
  // Param validation for the ID in the URL
  param('id').isMongoId().withMessage('Invalid official ID format.'),
  // All fields are optional for update, but if present, they must be valid
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters.'),
  body('position').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Position must be between 3 and 100 characters.'),
  body('contact_number').optional().trim().isMobilePhone('any').withMessage('Invalid contact number format.'),
  body('email').optional().trim().isEmail().withMessage('Invalid email format.'),
  body('location').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters.'),
  body('key_responsibility').optional().custom((value, { req }) => {
    try {
      const responsibilities = JSON.parse(value);
      if (!Array.isArray(responsibilities)) {
        throw new Error('Key responsibilities must be an array.');
      }
      if (responsibilities.some(r => typeof r !== 'string' || r.trim().length === 0)) {
        throw new Error('Each key responsibility must be a non-empty string.');
      }
    } catch (e) {
      throw new Error('Key responsibilities must be a valid JSON array of strings.');
    }
    return true;
  }),
  handleValidationErrors,
];

export const getOfficialsValidation = [
  query('is_deleted').optional().isBoolean().withMessage('is_deleted must be a boolean (true/false).'),
  handleValidationErrors,
];