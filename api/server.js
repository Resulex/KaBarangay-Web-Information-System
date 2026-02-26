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

dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 3000;

// --- ROUTES ---
app.use('/api/announcements', announcementRoutes);
app.use('/api/officials', officialRoutes); 
app.use('/api/document-requests', documentRequestRoutes);
app.use('/api/admins', adminRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});