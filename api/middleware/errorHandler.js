import e from 'express';
import logger from '../utils/logger.js';

// Custom Error Class for consistent error handling across the application
export class HttpError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // store validation errors
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || null;

  console.log(`Error occurred: ${message} - Status Code: ${statusCode} - Details: ${JSON.stringify(details)}`);

  // Specific error types handling
  if (err.name === 'ValidationError') { // From Mongoose/MongoDB validation
    statusCode = 400;
    message = 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ');
    // You might want to format Mongoose validation errors more specifically
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') { // Invalid MongoDB ObjectId
    statusCode = 400;
    message = 'Invalid ID format.';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { // JWT errors
    statusCode = 401;
    message = 'Unauthorized: Invalid or expired token.';
  } else if (err.name === 'ForbiddenError') { // Custom forbidden error
    statusCode = 403;
    message = 'Forbidden: You do not have permission to access this resource.';
  } else if (err.name === 'BSONError' && message.includes('ObjectId')) { // BSON/ObjectId errors
    statusCode = 400;
    message = 'Invalid ID format provided.';
  } else {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }


  // Log the error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - IP: ${req.ip} - Stack: ${err.stack}`);

  // Send the error response
  res.status(statusCode).json({
    error: {
      message: message,
      code: statusCode,
      details,
      // In production, you might not want to send the stack trace
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};

export default errorHandler;