import express from 'express';
import * as crud from './crud.js';
import { loginAdminValidation } from '../validation/adminValidation.js';

const router = express.Router();

// Login admin
router.post('/', loginAdminValidation, async (req, res, next) => {
  try {
    const data = await crud.loginAdmin(req.body.username, req.body.password);
    res.json(data);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

export default router;

