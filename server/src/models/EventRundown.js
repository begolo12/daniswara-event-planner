import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventRundown = sequelize.define('EventRundown', {
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
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  agenda: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  activity_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  technical_needs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mc_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expected_output: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'event_rundowns',
});

export default EventRundown;
