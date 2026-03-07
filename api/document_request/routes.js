import express from 'express';
import * as crud from './crud.js';
import { createDocumentRequestValidation, getAllDocumentRequestsValidation, getDocumentRequestBySearchValidation, updateDocumentRequestValidation, updateTimelineValidation, updateStatusValidation } from '../validation/documentRequestValidation.js';

const router = express.Router();

// GET All
router.get('/', getAllDocumentRequestsValidation, 
  async (req, res, next) => {
  try {
    console.log("Received request for document requests with headers:", req.headers);
    const data = await crud.getAllDocumentRequests();
    res.json(data);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// GET One by ID
router.get('/:search', getDocumentRequestBySearchValidation, 
  async (req, res) => {
  try {
    const data = await crud.getDocumentRequestBySearch(req.params.search);
    res.status(200).json(data);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// POST New
router.post('/', createDocumentRequestValidation, async (req, res, next) => {
  try {
    const result = await crud.createDocumentRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// PUT Update
router.put('/:id', updateDocumentRequestValidation, async (req, res, next) => {
  try {
    const result = await crud.updateDocumentRequest(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// PATCH Update timeline
router.patch('/:id/timeline', updateTimelineValidation, async (req, res) => {
  try {
    const result = await crud.updateTimeline(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

// PATCH Update status
router.patch('/:id/status', updateStatusValidation, async (req, res) => {
  try {
    const result = await crud.updateStatus(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

export default router;