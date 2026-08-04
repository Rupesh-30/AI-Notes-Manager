
const MONTHLY_LIMIT = 100;

// ==========================================
// Remaining Usage
// ==========================================

export function getRemainingUsage(totalRequests) {
  return Math.max(
    MONTHLY_LIMIT - totalRequests,
    0
  );
}

export { MONTHLY_LIMIT };

