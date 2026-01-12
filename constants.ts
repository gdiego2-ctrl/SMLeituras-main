/**
 * Global Application Constants
 * Centralized configuration for business rules and system behavior
 */

// ================================================
// PAYMENT CONFIGURATION
// ================================================

/**
 * Number of days after reading creation until payment is due
 * Changed from 15 to 5 days per business requirements
 */
export const PAYMENT_DEADLINE_DAYS = 5;

/**
 * Grace period (in days) before marking invoice as overdue
 */
export const PAYMENT_GRACE_PERIOD_DAYS = 0;

// ================================================
// READING SCHEDULE CONFIGURATION
// ================================================

/**
 * Standard interval (in days) between consecutive readings
 * System monitors and alerts when this period is exceeded
 */
export const READING_INTERVAL_DAYS = 30;

/**
 * Warning threshold (in days) before next reading is due
 * Dashboard shows warning when approaching this period
 */
export const READING_WARNING_THRESHOLD_DAYS = 28;

// ================================================
// CLIENT STATUS
// ================================================

/**
 * Available client status values
 */
export const CLIENT_STATUS = {
  ACTIVE: 'ativo',
  INACTIVE: 'inativo',
  SUSPENDED: 'suspenso',
} as const;

export type ClientStatus = typeof CLIENT_STATUS[keyof typeof CLIENT_STATUS];

// ================================================
// PAYMENT STATUS
// ================================================

/**
 * Payment status values (Mercado Pago integration)
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  IN_PROCESS: 'in_process',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ================================================
// READING STATUS
// ================================================

/**
 * Invoice/reading status values
 */
export const READING_STATUS = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
} as const;

export type ReadingStatus = typeof READING_STATUS[keyof typeof READING_STATUS];

// ================================================
// USER ROLES
// ================================================

/**
 * User role definitions
 */
export const USER_ROLE = {
  TECHNICIAN: 'tecnico',
  CLIENT: 'cliente',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

// ================================================
// ADMIN CONFIGURATION
// ================================================

/**
 * List of admin email addresses
 * Users with these emails automatically get technician/admin role
 */
export const ADMIN_EMAILS = [
  'bwasistemas@gmail.com',
  'gdiego2@gmail.com',
] as const;

// ================================================
// DATE HELPERS
// ================================================

/**
 * Calculate payment due date from current date
 */
export const getPaymentDueDate = (fromDate: Date = new Date()): Date => {
  const dueDate = new Date(fromDate);
  dueDate.setDate(dueDate.getDate() + PAYMENT_DEADLINE_DAYS);
  return dueDate;
};

/**
 * Calculate next reading date from current date
 */
export const getNextReadingDate = (fromDate: Date = new Date()): Date => {
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + READING_INTERVAL_DAYS);
  return nextDate;
};

/**
 * Calculate days since last reading
 */
export const getDaysSinceReading = (lastReadingDate: Date): number => {
  const now = new Date();
  const diff = now.getTime() - lastReadingDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if reading is overdue (30+ days)
 */
export const isReadingOverdue = (lastReadingDate: Date | null): boolean => {
  if (!lastReadingDate) return true; // Never had reading
  return getDaysSinceReading(lastReadingDate) >= READING_INTERVAL_DAYS;
};

/**
 * Check if payment is overdue
 */
export const isPaymentOverdue = (dueDate: Date): boolean => {
  const now = new Date();
  return now > dueDate;
};

// ================================================
// VALIDATION CONSTANTS
// ================================================

/**
 * Minimum password length
 */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Maximum file upload size (in bytes)
 */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * PIX QR Code expiration time (in minutes)
 */
export const PIX_QR_CODE_EXPIRATION_MINUTES = 30;
