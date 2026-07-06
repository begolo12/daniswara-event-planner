import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventEvaluation = sequelize.define('EventEvaluation', {
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
  actual_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rundown_compliance: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  issues_encountered: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget_planned: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  budget_actual: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  feedback_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  documentation_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  improvement_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ai_summary: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  ai_lesson_learned: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
}, {
  tableName: 'event_evaluations',
});

export default EventEvaluation;
