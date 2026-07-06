import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventTheme = sequelize.define('EventTheme', {
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
  theme_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tagline: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  philosophy: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  visual_direction: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dominant_colors: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('dominant_colors');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    },
    set(val) {
      this.setDataValue('dominant_colors', val ? JSON.stringify(val) : null);
    },
  },
  decoration_ideas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_selected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'event_themes',
});

export default EventTheme;
