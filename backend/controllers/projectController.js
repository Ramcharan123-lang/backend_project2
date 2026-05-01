import { Project } from '../models/index.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ include: ['assignedGroup_obj'] });
    const mapped = projects.map(p => {
      const json = p.toJSON();
      json._id = json.id;
      if (json.assignedGroup_obj) {
        json.assignedGroup = json.assignedGroup_obj;
        json.assignedGroup._id = json.assignedGroup.id;
        delete json.assignedGroup_obj;
      }
      return json;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, { include: ['assignedGroup_obj'] });
    if (project) {
      const json = project.toJSON();
      json._id = json.id;
      if (json.assignedGroup_obj) {
        json.assignedGroup = json.assignedGroup_obj;
        json.assignedGroup._id = json.assignedGroup.id;
        delete json.assignedGroup_obj;
      }
      res.json(json);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, assignedGroup, deadline } = req.body;
    const project = await Project.create({ 
      title, description, deadline, assignedGroup: assignedGroup || null 
    });
    res.status(201).json({ ...project.toJSON(), _id: project.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (project) {
      project.title = req.body.title || project.title;
      project.description = req.body.description || project.description;
      project.assignedGroup = req.body.assignedGroup || project.assignedGroup;
      project.deadline = req.body.deadline || project.deadline;
      project.status = req.body.status || project.status;
      await project.save();
      res.json({ ...project.toJSON(), _id: project.id });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (project) {
      await project.destroy();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
