import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RiskBackupPlan = sequelize.define('RiskBackupPlan', {
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
  risk: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  impact: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  probability: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  backup_plan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('identified', 'mitigated', 'resolved'),
    defaultValue: 'identified',
  },
}, {
  tableName: 'risk_backup_plans',
});

export default RiskBackupPlan;
