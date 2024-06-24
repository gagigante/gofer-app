import { type UserRole } from '@/api/types/user-role'

export const ROLES: Record<UserRole, string> = {
  operator: 'Operador',
  admin: 'Administrador',
  'super-admin': 'Super Administrador',
}
