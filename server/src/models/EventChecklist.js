import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventChecklist = sequelize.define('EventChecklist', {
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
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  item_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  pic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'done'),
    defaultValue: 'not_started',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'event_checklists',
});

export default EventChecklist;
