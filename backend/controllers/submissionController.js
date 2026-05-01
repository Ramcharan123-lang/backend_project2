import { Submission } from '../models/index.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ storage });

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({ include: ['projectId_obj', 'groupId_obj'] });
    const mapped = submissions.map(s => {
      const json = s.toJSON();
      json._id = json.id;
      if (json.projectId_obj) {
        json.projectId = json.projectId_obj;
        json.projectId._id = json.projectId.id;
        delete json.projectId_obj;
      }
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

export const createSubmission = async (req, res) => {
  try {
    const { projectId, groupId } = req.body;
    let fileUrl = '';
    
    if (req.file) {
      fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const submission = await Submission.create({ projectId, groupId, fileUrl });
    res.status(201).json({ ...submission.toJSON(), _id: submission.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (req.user && req.user.role === 'admin') {
      if (req.body.grade !== undefined) submission.grade = req.body.grade;
      if (req.body.status !== undefined) submission.status = req.body.status;
    }
    
    if (req.file) {
      submission.fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    await submission.save();
    res.json({ ...submission.toJSON(), _id: submission.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (submission) {
      await submission.destroy();
      res.json({ message: 'Submission deleted' });
    } else {
      res.status(404).json({ message: 'Submission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
