import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'system' },
  entityType: { type: String, required: true },
  entityId: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
