import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  action,
  user,
  entityType,
  entityId = '',
  details = {},
  req = null
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AuditLog.create({
      action,
      user: user?._id,
      userName: user?.name || 'System',
      userRole: user?.role || 'system',
      entityType,
      entityId: String(entityId),
      details,
      ipAddress
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};
