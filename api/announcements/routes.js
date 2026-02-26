import express from 'express';
import * as crud from './crud.js';
import { authenticateToken } from '../middleware/authenticate.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// GET All
router.get('/', async (req, res) => {
  try {
    console.log("Received request for announcements with headers:", req.headers);
    console.log("Authenticated user:", req.user, !!req.user); // Log authenticated user info (if any)
     const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let isAdmin = false;
    console.log("Token found in headers:", token); // Log whether token is present
    if (token) {
      try {
        // Attempt to verify token without requiring it
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (err) {
        isAdmin = false;
        console.log("Token verification failed, treating as non-admin:", err.message); // Log token verification failure
      }
    }
    const filter = isAdmin ? {} : { is_hidden: false };
    const data = await crud.getAllAnnouncements(filter);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New
router.post('/', authenticateToken, async (req, res) => {
  try {
    const result = await crud.createAnnouncement(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await crud.updateAnnouncement(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH hidden
router.patch('/:id/toggle-hidden', authenticateToken, async (req, res) => {
  try {
    const result = await crud.toggleHidden(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await crud.deleteAnnouncement(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
