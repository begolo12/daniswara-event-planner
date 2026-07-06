import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MasterVenue = sequelize.define('MasterVenue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rental_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  facilities: {
    type: DataTypes.TEXT,
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
  tableName: 'master_venues',
});

export default MasterVenue;
