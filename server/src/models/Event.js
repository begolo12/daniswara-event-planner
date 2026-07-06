import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  event_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'event_types', key: 'id' },
  },
  event_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  format: {
    type: DataTypes.ENUM('offline', 'online', 'hybrid'),
    defaultValue: 'offline',
  },
  estimated_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  target_participants: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tone: {
    type: DataTypes.ENUM('formal', 'semi_formal', 'santai', 'inspiratif', 'seremonial'),
    defaultValue: 'formal',
  },
  budget_max: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  division: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pic_main_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'planning', 'waiting_approval', 'preparation', 'ready', 'on_going', 'done', 'evaluated', 'cancelled'),
    defaultValue: 'draft',
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
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'events',
});

export default Event;
