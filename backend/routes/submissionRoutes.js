import express from 'express';
import { getSubmissions, createSubmission, upload, updateSubmission, deleteSubmission } from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubmissions)
  .post(protect, upload.single('fileUrl'), createSubmission);

router.route('/:id')
  .put(protect, upload.single('fileUrl'), updateSubmission)
  .delete(protect, deleteSubmission);

export default router;
