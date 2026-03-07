import { body, param, query, validationResult } from 'express-validator';
import { HttpError } from '../middleware/errorHandler.js'; // Ensure this path is correct

// Centralized handler for validation errors
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

// Validation for creating a new announcement
export const createAnnouncementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  // date and is_hidden are set by the server in crud, not directly by user input for creation
  handleValidationErrors,
];

// Validation for updating an existing announcement
export const updateAnnouncementValidation = [
  param('id').isMongoId().withMessage('Invalid announcement ID format.'),
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high.'),
  body('description').optional().trim(),
  body('is_hidden').optional().isBoolean().withMessage('is_hidden must be a boolean value.'),
  handleValidationErrors,
];

// Validation for getting announcements (e.g., if you have query filters)
export const getAnnouncementsValidation = [
  query('is_hidden').optional().isBoolean().withMessage('is_hidden query parameter must be a boolean (true/false).'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority filter must be one of: low, medium, high.'),
  handleValidationErrors,
];

// Validation for toggling hidden status specifically
export const toggleHiddenValidation = [
  param('id').isMongoId().withMessage('Invalid announcement ID format.'),
  body('is_hidden').isBoolean().withMessage('is_hidden is required and must be a boolean value.'),
  handleValidationErrors,
];