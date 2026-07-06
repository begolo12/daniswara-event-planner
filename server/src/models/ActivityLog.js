import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  old_values: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('old_values');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    },
    set(val) {
      this.setDataValue('old_values', val ? JSON.stringify(val) : null);
    },
  },
  new_values: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('new_values');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    },
    set(val) {
      this.setDataValue('new_values', val ? JSON.stringify(val) : null);
    },
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  // Activity logs should not have soft delete
  paranoid: false,
});

export default ActivityLog;
