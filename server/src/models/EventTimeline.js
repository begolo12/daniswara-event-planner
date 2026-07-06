import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventTimeline = sequelize.define('EventTimeline', {
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
  phase: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  activity: {
    type: DataTypes.TEXT,
    allowNull: false,
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
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  risk_if_late: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'waiting_approval', 'done', 'delayed', 'cancelled'),
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
  tableName: 'event_timelines',
});

export default EventTimeline;
