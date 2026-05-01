import express from 'express';
import { getGroups, createGroup, getGroupMessages, addMember, removeMember } from '../controllers/groupController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getGroups)
  .post(protect, admin, createGroup);

router.route('/:id/messages')
  .get(protect, getGroupMessages);

router.route('/:id/members/:userId')
  .post(protect, admin, addMember)
  .delete(protect, admin, removeMember);

export default router;
