import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AISetting = sequelize.define('AISetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  provider_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  base_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  api_key_encrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  default_system_prompt: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  temperature: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0.7,
  },
  max_tokens: {
    type: DataTypes.INTEGER,
    defaultValue: 8000,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_test_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_test_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'ai_settings',
});

export default AISetting;
