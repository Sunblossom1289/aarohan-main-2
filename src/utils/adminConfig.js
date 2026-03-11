// ============================================================
// DEPRECATED: Admin access is now controlled via database
// The `hasAdminAccess` field in the Counselor model determines admin access
// This file is kept for backward compatibility but is no longer used
// ============================================================

// To grant admin access to a counselor:
// 1. In MongoDB, set hasAdminAccess: true on the counselor document
// 2. Or use the admin panel to toggle admin access

export const ADMIN_PHONE_NUMBERS = [];

export const hasAdminAccess = (phone) => {
  console.warn('adminConfig.hasAdminAccess is deprecated. Use user.hasAdminAccess from database instead.');
  return false;
};
