/**
 * Firebase Cloud Functions stubs for scheduled notifications.
 * Deploy separately if you want server-side daily/monthly/budget pushes.
 *
 * Example topics / data payloads the mobile client already understands:
 * - daily_reminder
 * - budget_alert
 * - monthly_reminder
 */

export const FCM_DATA_TYPES = {
  DAILY_REMINDER: 'daily_reminder',
  BUDGET_ALERT: 'budget_alert',
  MONTHLY_REMINDER: 'monthly_reminder',
} as const;
