import { Task } from '../models/index.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ include: ['assignedTo_obj', 'projectId_obj'] });
    const mapped = tasks.map(t => {
      const json = t.toJSON();
      json._id = json.id;
      if (json.assignedTo_obj) {
        json.assignedTo = json.assignedTo_obj;
        json.assignedTo._id = json.assignedTo.id;
        delete json.assignedTo_obj;
      }
      if (json.projectId_obj) {
        json.projectId = json.projectId_obj;
        json.projectId._id = json.projectId.id;
        delete json.projectId_obj;
      }
      return json;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId } = req.body;
    const task = await Task.create({ 
      title, description, assignedTo: assignedTo || null, projectId 
    });
    res.status(201).json({ ...task.toJSON(), _id: task.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
      task.projectId = req.body.projectId || task.projectId;
      task.status = req.body.status || task.status;
      if (req.body.marks !== undefined) task.marks = req.body.marks;
      await task.save();
      res.json({ ...task.toJSON(), _id: task.id });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.destroy();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
