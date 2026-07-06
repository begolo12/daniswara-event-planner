import sequelize from '../config/database.js';
import User from './User.js';
import EventType from './EventType.js';
import Event from './Event.js';
import EventTheme from './EventTheme.js';
import EventTimeline from './EventTimeline.js';
import EventRundown from './EventRundown.js';
import EventChecklist from './EventChecklist.js';
import EventTask from './EventTask.js';
import EventBudget from './EventBudget.js';
import EventVendor from './EventVendor.js';
import EventDocument from './EventDocument.js';
import EventApproval from './EventApproval.js';
import EventEvaluation from './EventEvaluation.js';
import EventFeedback from './EventFeedback.js';
import RiskBackupPlan from './RiskBackupPlan.js';
import AISetting from './AISetting.js';
import AIGenerationLog from './AIGenerationLog.js';
import MasterVendor from './MasterVendor.js';
import MasterVenue from './MasterVenue.js';
import MasterEquipment from './MasterEquipment.js';
import ActivityLog from './ActivityLog.js';

// ── User ↔ Event ──────────────────────────────────────
User.hasMany(Event, { as: 'createdEvents', foreignKey: 'created_by' });
Event.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

User.hasMany(Event, { as: 'picEvents', foreignKey: 'pic_main_id' });
Event.belongsTo(User, { as: 'picMain', foreignKey: 'pic_main_id' });

Event.belongsTo(User, { as: 'approver', foreignKey: 'approved_by' });

// ── EventType ↔ Event ─────────────────────────────────
EventType.hasMany(Event, { foreignKey: 'event_type_id' });
Event.belongsTo(EventType, { foreignKey: 'event_type_id' });

// ── Event ↔ Sub-resources (hasMany) ───────────────────
Event.hasMany(EventTheme, { foreignKey: 'event_id', as: 'themes' });
Event.hasMany(EventTimeline, { foreignKey: 'event_id', as: 'timelines' });
Event.hasMany(EventRundown, { foreignKey: 'event_id', as: 'rundowns' });
Event.hasMany(EventChecklist, { foreignKey: 'event_id', as: 'checklists' });
Event.hasMany(EventTask, { foreignKey: 'event_id', as: 'tasks' });
Event.hasMany(EventBudget, { foreignKey: 'event_id', as: 'budgets' });
Event.hasMany(EventVendor, { foreignKey: 'event_id', as: 'vendors' });
Event.hasMany(EventDocument, { foreignKey: 'event_id', as: 'documents' });
Event.hasMany(EventApproval, { foreignKey: 'event_id', as: 'approvals' });
Event.hasMany(EventEvaluation, { foreignKey: 'event_id', as: 'evaluations' });
Event.hasMany(EventFeedback, { foreignKey: 'event_id', as: 'feedbacks' });
Event.hasMany(RiskBackupPlan, { foreignKey: 'event_id', as: 'risks' });

// ── Sub-resources → Event (belongsTo) ─────────────────
EventTheme.belongsTo(Event, { foreignKey: 'event_id' });
EventTimeline.belongsTo(Event, { foreignKey: 'event_id' });
EventRundown.belongsTo(Event, { foreignKey: 'event_id' });
EventChecklist.belongsTo(Event, { foreignKey: 'event_id' });
EventTask.belongsTo(Event, { foreignKey: 'event_id' });
EventBudget.belongsTo(Event, { foreignKey: 'event_id' });
EventVendor.belongsTo(Event, { foreignKey: 'event_id' });
EventDocument.belongsTo(Event, { foreignKey: 'event_id' });
EventApproval.belongsTo(Event, { foreignKey: 'event_id' });
EventEvaluation.belongsTo(Event, { foreignKey: 'event_id' });
EventFeedback.belongsTo(Event, { foreignKey: 'event_id' });
RiskBackupPlan.belongsTo(Event, { foreignKey: 'event_id' });

// ── Sub-resources → User (pic) ────────────────────────
EventTimeline.belongsTo(User, { as: 'pic', foreignKey: 'pic_id' });
EventRundown.belongsTo(User, { as: 'pic', foreignKey: 'pic_id' });
EventChecklist.belongsTo(User, { as: 'pic', foreignKey: 'pic_id' });
EventTask.belongsTo(User, { as: 'pic', foreignKey: 'pic_id' });
RiskBackupPlan.belongsTo(User, { as: 'pic', foreignKey: 'pic_id' });

User.hasMany(EventTask, { as: 'assignedTasks', foreignKey: 'pic_id' });

// ── EventDocument → User (creator, approver) ──────────
EventDocument.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
EventDocument.belongsTo(User, { as: 'approver', foreignKey: 'approved_by' });

// ── EventApproval → User (reviewer) ───────────────────
EventApproval.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewer_id' });

// ── AIGenerationLog → User, Event ─────────────────────
AIGenerationLog.belongsTo(User, { foreignKey: 'user_id' });
AIGenerationLog.belongsTo(Event, { foreignKey: 'event_id' });

// ── ActivityLog → User ────────────────────────────────
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

export {
  sequelize,
  User,
  EventType,
  Event,
  EventTheme,
  EventTimeline,
  EventRundown,
  EventChecklist,
  EventTask,
  EventBudget,
  EventVendor,
  EventDocument,
  EventApproval,
  EventEvaluation,
  EventFeedback,
  RiskBackupPlan,
  AISetting,
  AIGenerationLog,
  MasterVendor,
  MasterVenue,
  MasterEquipment,
  ActivityLog,
};
