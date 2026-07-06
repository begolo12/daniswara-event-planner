import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventApproval = sequelize.define('EventApproval', {
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
  event_document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'event_documents', key: 'id' },
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('approved', 'revisi', 'rejected'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'event_approvals',
});

export default EventApproval;
