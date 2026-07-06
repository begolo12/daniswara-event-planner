import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventBudget = sequelize.define('EventBudget', {
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
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  item: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  total_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  can_be_reduced: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  saving_alternative: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  receipt_file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'event_budgets',
});

export default EventBudget;
