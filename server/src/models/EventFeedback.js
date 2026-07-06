import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventFeedback = sequelize.define('EventFeedback', {
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
  respondent_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'event_feedbacks',
});

export default EventFeedback;
