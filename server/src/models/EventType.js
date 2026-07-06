import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventType = sequelize.define('EventType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  default_template: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('default_template');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    },
    set(val) {
      this.setDataValue('default_template', val ? JSON.stringify(val) : null);
    },
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'event_types',
});

export default EventType;
