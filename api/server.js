import express from 'express';
import cors from 'cors';
import announcementRoutes from './announcements/routes.js';
import officialRoutes from './officials/routes.js';
import documentRequestRoutes from './document_request/routes.js';
import adminRoutes from './admins/routes.js';
import authRoutes from './google_auth/routes.js';
import session from 'express-session';
import passport from './config/passport.js';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Helmet for security headers
import morgan from 'morgan'; // Morgan for request logging

import logger from './utils/logger.js'; // Winston logger
import errorHandler from './middleware/errorHandler.js'; // Centralized error handler


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//Security Middleware - Helmet
app.use(helmet());

//Request Logging Middleware - Morgan
// 'combined' for standard Apache-style logs, pipe to Winston
app.use(morgan('combined', { stream: logger.stream }));

app.use(cors());
app.use(express.json()); // Essential: allows Express to read JSON in request bodies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());


// --- ROUTES ---
app.use('/api/announcements', announcementRoutes);
app.use('/api/officials', officialRoutes); 
app.use('/api/document-requests', documentRequestRoutes);
app.use('/api/admins', adminRoutes);
app.use('/auth', authRoutes);

// Centralized Error Handling Middleware (MUST be the last middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});