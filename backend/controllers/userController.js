import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: ['groupId_obj'] });
    const mapped = users.map(u => {
      const json = u.toJSON();
      json._id = json.id;
      if (json.groupId_obj) {
        json.groupId = json.groupId_obj;
        json.groupId._id = json.groupId.id;
        delete json.groupId_obj;
      }
      return json;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, year, branch, groupId } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ 
      name, email, password: hashedPassword, role, phone, year, branch, 
      groupId: groupId || null 
    });
    res.status(201).json({ ...user.toJSON(), _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;
      user.year = req.body.year || user.year;
      user.branch = req.body.branch || user.branch;
      user.groupId = req.body.groupId || user.groupId;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      await user.save();
      res.json({ ...user.toJSON(), _id: user.id });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrivateMessages = async (req, res) => {
  try {
    const { targetId } = req.params;
    const userId = req.user.id;
    
    // Import Op dynamically to avoid cyclic dependency issues or direct export problems if not already imported
    const { Op } = await import('sequelize');
    const { Message } = await import('../models/index.js');
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: userId, receiverId: targetId },
          { sender: targetId, receiverId: userId }
        ]
      },
      include: ['sender_obj'],
      order: [['createdAt', 'ASC']]
    });

    const mapped = messages.map(m => {
      const json = m.toJSON();
      if (json.sender_obj) {
        json.sender = json.sender_obj;
        json.sender._id = json.sender.id;
        delete json.sender_obj;
      }
      return json;
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
