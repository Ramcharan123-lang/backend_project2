import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getPrivateMessages } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route('/:targetId/messages')
  .get(protect, getPrivateMessages);

export default router;
