import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MasterEquipment = sequelize.define('MasterEquipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  quantity_available: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  condition: {
    type: DataTypes.ENUM('good', 'fair', 'poor', 'maintenance'),
    defaultValue: 'good',
  },
  storage_location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'master_equipments',
});

export default MasterEquipment;
