import sequelize from '../config/database.js';
import User from './User.js';
import Group from './Group.js';
import Project from './Project.js';
import Task from './Task.js';
import Submission from './Submission.js';
import Message from './Message.js';

// User <-> Group
User.belongsTo(Group, { foreignKey: 'groupId', as: 'groupId_obj' }); // we'll remap in controller to avoid naming collision with column
Group.hasMany(User, { foreignKey: 'groupId', as: 'members' });

// Project <-> Group
Project.belongsTo(Group, { foreignKey: 'assignedGroup', as: 'assignedGroup_obj' });
Group.hasMany(Project, { foreignKey: 'assignedGroup' });

// Task <-> User (Assigned To)
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedTo_obj' });
User.hasMany(Task, { foreignKey: 'assignedTo' });

// Task <-> Project
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'projectId_obj' });
Project.hasMany(Task, { foreignKey: 'projectId' });

// Submission <-> Project
Submission.belongsTo(Project, { foreignKey: 'projectId', as: 'projectId_obj' });
Project.hasMany(Submission, { foreignKey: 'projectId' });

// Submission <-> Group
Submission.belongsTo(Group, { foreignKey: 'groupId', as: 'groupId_obj' });
Group.hasMany(Submission, { foreignKey: 'groupId' });

// Message <-> User (Sender)
Message.belongsTo(User, { foreignKey: 'sender', as: 'sender_obj' });
User.hasMany(Message, { foreignKey: 'sender' });

// Message <-> Group
Message.belongsTo(Group, { foreignKey: { name: 'groupId', allowNull: true }, as: 'groupId_obj' });
Group.hasMany(Message, { foreignKey: 'groupId' });

// Message <-> User (Receiver for Private Chat)
Message.belongsTo(User, { foreignKey: { name: 'receiverId', allowNull: true }, as: 'receiverId_obj' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

export {
  sequelize,
  User,
  Group,
  Project,
  Task,
  Submission,
  Message
};
