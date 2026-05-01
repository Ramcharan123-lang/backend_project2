import { Group, User } from '../models/index.js';

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({ include: ['members'] });
    const mapped = groups.map(g => {
      const json = g.toJSON();
      json._id = json.id;
      if (json.members) {
        json.members = json.members.map(m => {
          m._id = m.id;
          return m;
        });
      }
      return json;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = await Group.create({ name });
    
    // Add members if passed an array of user IDs
    if (members && members.length > 0) {
      await User.update({ groupId: group.id }, { where: { id: members } });
    }
    
    // Fetch newly created group with members
    const newGroup = await Group.findByPk(group.id, { include: ['members'] });
    const json = newGroup.toJSON();
    json._id = json.id;
    res.status(201).json(json);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { Message } = await import('../models/index.js');
    
    if (id === 'global') {
      const messages = await Message.findAll({
        where: { groupId: null, receiverId: null },
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
      return res.json(mapped);
    }

    const messages = await Message.findAll({
      where: { groupId: id },
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

export const addMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await User.update({ groupId: id }, { where: { id: userId } });
    const group = await Group.findByPk(id, { include: ['members'] });
    const json = group.toJSON();
    json._id = json.id;
    if (json.members) {
      json.members = json.members.map(m => {
        m._id = m.id;
        return m;
      });
    }
    res.json(json);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await User.update({ groupId: null }, { where: { id: userId, groupId: id } });
    const group = await Group.findByPk(id, { include: ['members'] });
    const json = group.toJSON();
    json._id = json.id;
    if (json.members) {
      json.members = json.members.map(m => {
        m._id = m.id;
        return m;
      });
    }
    res.json(json);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
