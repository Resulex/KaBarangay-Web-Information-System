import express from 'express';
import * as crud from './crud.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = express.Router();

// Login admin
router.post('/', async (req, res) => {
  try {
    const data = await crud.loginAdmin(req.body.username, req.body.password);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

