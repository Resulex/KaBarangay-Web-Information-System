import express from 'express';
import * as crud from './crud.js';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticate.js';
import { uploadToS3 } from '../utils/file-upload.js';
import dotenv from 'dotenv';
import { createOfficialValidation, getOfficialsValidation, updateOfficialValidation } from '../validation/officialValidation.js';


dotenv.config();

const router = express.Router();

// Configure multer for file uploads (temporary storage before S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
    }
  }
});

// GET All
router.get('/', getOfficialsValidation, async (req, res, next) => {
  try {
    const filter = req.query.is_deleted === 'false' ? { is_deleted: false } : {};
    const data = await crud.getAllOfficials(filter);
    res.json(data);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// POST - Create new official with image
router.post('/', upload.single('image'), createOfficialValidation, authenticateToken, async (req, res) => {
  try {
    let imageUrl = null;

    // Upload image to S3 if provided
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const officialData = {
      name: req.body.name,
      position: req.body.position,
      contact_number: req.body.contact_number,
      email: req.body.email,
      location: req.body.location,
      // Parse responsibility array from string
      key_responsibility: req.body.key_responsibility ? JSON.parse(req.body.key_responsibility) : [],
      image_url: imageUrl, // Passed to crud.js
      is_deleted: false
    };

    const result = await crud.createOfficial(officialData);
    res.status(201).json(result); // Contains the _id and image_url
  } catch (err) {
    console.error("Error in POST /officials:", err);
    next(err); // Pass to centralized error handler
  }
});

// PUT - Update official with image
router.put('/:id', updateOfficialValidation, authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    let imageUrl = req.body.image_url; // Keep existing image by default

    // Upload new image to S3 if provided
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const officialData = {
      name: req.body.name,
      position: req.body.position,
      contact_number: req.body.contact_number,
      email: req.body.email,
      location: req.body.location,
      key_responsibility: JSON.parse(req.body.key_responsibility),
      image_url: imageUrl
    };

    const result = await crud.updateOfficial(req.params.id, officialData);
    res.json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// DELETE Official
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await crud.deleteOfficial(req.params.id);
    res.json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

export default router;