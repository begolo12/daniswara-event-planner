import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventDocument = sequelize.define('EventDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'events', key: 'id' },
  },
  doc_type: {
    type: DataTypes.ENUM('invitation', 'memo', 'tor', 'proposal', 'mc_script', 'director_speech', 'committee_speech', 'rundown_pdf', 'checklist_pdf', 'report', 'evaluation'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'event_documents',
});

export default EventDocument;
