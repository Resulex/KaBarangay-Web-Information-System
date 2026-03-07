import { body, query, param, validationResult } from 'express-validator';
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

// Common validation for timeline array elements
const timelineEntryValidation = () => [
  body('timeline.*.step').notEmpty().withMessage('Timeline step is required.').isString().withMessage('Timeline step must be a string.'),
  body('timeline.*.date').notEmpty().withMessage('Timeline date is required.').isISO8601().toDate().withMessage('Timeline date must be a valid date string.'),
  body('timeline.*.status').notEmpty().withMessage('Timeline status is required.').isString().withMessage('Timeline status must be a string.'),
];

// Validation for creating a new document request
export const createDocumentRequestValidation = [
  body('request_id').trim().notEmpty().withMessage('Request ID is required.').isString().withMessage('Request ID must be a string.'),
  body('status').notEmpty().withMessage('Status is required.').isIn(['Pending', 'Processing', 'Ready for Pickup', 'Picked-up']).withMessage('Status must be Pending, Processing, Ready for Pickup, or Picked-up.'),
  body('document').trim().notEmpty().withMessage('Document type is required.').isString().withMessage('Document must be a string.'),

  // Applicant details
  body('applicant.name').trim().notEmpty().withMessage('Applicant name is required.').isString().withMessage('Applicant name must be a string.'),
  body('applicant.contact').trim().notEmpty().withMessage('Applicant contact is required.').isMobilePhone('any').withMessage('Invalid applicant contact number format.'),
  body('applicant.email').trim().notEmpty().withMessage('Applicant email is required.').isEmail().withMessage('Invalid applicant email format.'),

  body('purpose').trim().notEmpty().withMessage('Purpose is required.').isString().withMessage('Purpose must be a string.'),
  
  // expected_completion is optional, but if present must be a date
  body('expected_completion').optional().isISO8601().toDate().withMessage('Expected completion must be a valid ISO 8601 date string.'),
  
  // timeline is optional on creation, but if present, must be a valid array of objects
  body('timeline').optional().isArray().withMessage('Timeline must be an array.')
    .custom((value) => {
      if (value.length > 0 && !value.every(entry => 
          typeof entry.step === 'string' && entry.step.trim().length > 0 &&
          typeof entry.date === 'string' && entry.date.trim().length > 0 &&
          typeof entry.status === 'string' && entry.status.trim().length > 0
      )) {
          throw new Error('Each timeline entry must have non-empty step, date, and status strings.');
      }
      return true;
    }),
  ...timelineEntryValidation(), // Apply nested validation if timeline exists

  handleValidationErrors,
];

// Validation for updating an existing document request
export const updateDocumentRequestValidation = [
  param('id').isMongoId().withMessage('Invalid document request ID format.'),
  // All fields are optional for update, but if present, they must be valid
  body('status').optional().isIn(['Pending', 'Processing', 'Ready for Pickup', 'Picked-up']).withMessage('Status must be Pending, Processing, Ready for Pickup, or Picked-up.'),
  body('document').optional().trim().isString().withMessage('Document must be a string.'),

  
  // timeline array for update (can replace the whole array)
  body('timeline').optional().isArray().withMessage('Timeline must be an array.')
    .custom((value) => {
      if (value.length > 0 && !value.every(entry => 
          typeof entry.step === 'string' && entry.step.trim().length > 0 &&
          typeof entry.date === 'string' && entry.date.trim().length > 0 &&
          typeof entry.status === 'string' && entry.status.trim().length > 0
      )) {
          throw new Error('Each timeline entry must have non-empty step, date, and status strings.');
      }
      return true;
    }),
  ...timelineEntryValidation(), // Apply nested validation if timeline exists

  handleValidationErrors,
];

// Validation for getting all document requests (query filters)
export const getAllDocumentRequestsValidation = [
  query('status').optional().isIn(['Pending', 'Processing', 'Ready for pickup', 'Picked-up']).withMessage('Filter status must be Pending, Processing, Ready for Pickup, or Picked-up.'),
  query('document').optional().trim().isString().withMessage('Filter document must be a string.'),
  query('applicant_email').optional().trim().isEmail().withMessage('Filter applicant email must be a valid email format.'), // applicant.email filter
  handleValidationErrors,
];

// Validation for searching a document request
export const getDocumentRequestBySearchValidation = [
  param('search').trim().notEmpty().withMessage('Search query is required.').isString().withMessage('Search query must be a string.'),
  handleValidationErrors,
];

// Validation for updating timeline specifically (PATCH)
export const updateTimelineValidation = [
  param('id').isMongoId().withMessage('Invalid document request ID format.'),
  body('timeline').notEmpty().withMessage('Timeline array is required.').isArray().withMessage('Timeline must be an array.')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Timeline array cannot be empty.');
      }
      if (!value.every(entry => 
          typeof entry.step === 'string' && entry.step.trim().length > 0 &&
          typeof entry.date === 'string' && entry.date.trim().length > 0 &&
          typeof entry.status === 'string' && entry.status.trim().length > 0
      )) {
          throw new Error('Each timeline entry must have non-empty step, date, and status strings.');
      }
      return true;
    }),
  ...timelineEntryValidation(), // Apply nested validation
  handleValidationErrors,
];

// Validation for updating status specifically (PATCH)
export const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid document request ID format.'),
  body('status').notEmpty().withMessage('Status is required.').isIn(['Pending', 'Processing', 'Ready for Pickup', 'Picked-up']).withMessage('Status must be Pending, Processing, Ready for Pickup, or Picked-up.'),
  handleValidationErrors,
];