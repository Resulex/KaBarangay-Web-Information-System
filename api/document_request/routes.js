import express from 'express';
import * as crud from './crud.js';

const router = express.Router();

// GET All
router.get('/', async (req, res) => {
  try {
    console.log("Received request for document requests with headers:", req.headers);
    const data = await crud.getAllDocumentRequests();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET One by ID
router.get('/:search', async (req, res) => {
  try {
    const data = await crud.getDocumentRequestBySearch(req.params.search);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New
router.post('/', async (req, res) => {
  try {
    const result = await crud.createDocumentRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update
router.put('/:id', async (req, res) => {
  try {
    const result = await crud.updateDocumentRequest(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update timeline
router.patch('/:id/timeline', async (req, res) => {
  try {
    const result = await crud.updateTimeline(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update status
router.patch('/:id/status', async (req, res) => {
  try {
    const result = await crud.updateStatus(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;