import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import * as adminCrud from '../admins/crud.js';

const router = express.Router();

// Google login route
router.get('/login', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google callback route
router.get('/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Get or create user from Google profile
      const googleUser = req.user;
      
      // Check if user exists in database
      let user = await adminCrud.findAdminByEmail(googleUser.email);
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Redirect with token as query parameter
      res.redirect(`http://127.0.0.1:5500/admin-dashboard.html?token=${token}`);
    } catch (err) {
      res.redirect(`http://127.0.0.1:5500/?error=${err.message}`);
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