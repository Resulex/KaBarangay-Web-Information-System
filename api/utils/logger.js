import winston from 'winston';
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url'; // For __dirname equivalent in ES Modules

// Get the directory name of the current module file (api/utils)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the 'logs' directory within the 'api' folder
const logsDirectory = path.join(__dirname, '..', 'logs'); // Go up one level (from utils to api), then into 'logs'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Log stack traces for errors
    winston.format.splat(),
    winston.format.json() // Output logs in JSON format
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // Simple format for console readability
      ),
      level: 'debug' // Show debug logs in console
    }),
    // File transport for all logs (info and above) - using absolute path
    new winston.transports.File({ filename: path.join(logsDirectory, 'combined.log'), level: 'info' }),
    // File transport for error logs only - using absolute path
    new winston.transports.File({ filename: path.join(logsDirectory, 'error.log'), level: 'error' }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object with a 'write' function that Winston can use
// This is used by Morgan to pipe HTTP request logs into Winston
logger.stream = {
  write: (message) => {
    logger.info(message.trim()); // Morgan messages typically have a newline at the end
  },
};

export default logger;