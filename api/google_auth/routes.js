import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { findAdminByEmail } from '../admins/crud.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Google login route
router.get('/login', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Route to initiate Google OAuth login
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] }));

  // handle the "Cannot GET /auth/login" error
router.get('/login-failed', (req, res) => {
  res.status(401).send('Authentication failed. Please ensure you are an authorized admin.');
});


// Google OAuth callback route
router.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/login-failed', session: false  }),
  async (req, res) => {
    try {
      console.log("User object in callback:", req.user);
      // req.user contains the Google profile information (from Passport strategy)
      
      const googleUserEmail = req.user?.email;

      if (!googleUserEmail) {
        console.warn('Google user email not found after authentication.');
        return res.redirect('http://127.0.0.1:5500/admin-login.html?error=no_email'); // Redirect to public home if email is missing
      }

      // Check if this Google user email exists in your admin collection
      const admin = await findAdminByEmail(googleUserEmail);

      if (admin) {
        // Admin found: Generate a JWT token for the admin
        const token = jwt.sign(
          { id: admin._id, email: admin.email, username: admin.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Redirect to the admin dashboard, passing the token
        // The frontend dashboard page will need to extract this token from the URL and store it (e.g., in sessionStorage)
        return res.redirect(`http://127.0.0.1:5500/admin-dashboard.html?token=${token}`);
      } else {
        // User is not an admin, redirect to public home or a login error page
        console.log(`Google user ${googleUserEmail} is not an authorized admin.`);
        return res.redirect(`http://127.0.0.1:5500/?error=unauthorized_admin&email=${googleUserEmail}`); 
      }
    } catch (err) {
      console.error('Error during Google callback for admin check:', err);
      res.redirect('/error'); // Redirect to an error page
    }
  }
);


// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('http://127.0.0.1:5500/');
  });
});

export default router;