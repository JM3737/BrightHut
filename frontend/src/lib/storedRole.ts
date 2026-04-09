/**
 * Canonical role string from localStorage (trimmed, lowercased).
 * Trims so values like "staff " or "\ufeffadmin" from APIs don't break strict checks.
 */
export function getStoredRole(): string {
  return (localStorage.getItem('role') ?? '').trim().toLowerCase()
}

export function isStaffLikeRole(role = getStoredRole()): boolean {
  return role === 'staff' || role === 'admin'
}

/** Persist role from API responses in a normalized form. */
export function normalizeRoleForStorage(role: string | undefined | null): string {
  return String(role ?? '').trim().toLowerCase()
}
