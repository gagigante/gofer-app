import type { UserRole } from '../types/user-role'

export const USER_ROLE_LEVELS: Record<UserRole, number> = {
  'super-admin': 3,
  admin: 2,
  operator: 1,
}
