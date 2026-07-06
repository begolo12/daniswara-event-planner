import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AIGenerationLog = sequelize.define('AIGenerationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'events', key: 'id' },
  },
  generation_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  prompt: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  response: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  model_used: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  token_input: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  token_output: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    defaultValue: 'success',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'ai_generation_logs',
});

export default AIGenerationLog;
