import { randomUUID } from 'node:crypto'
import { type UserRole } from '../types/user-role'

export class User {
  public id: string
  public name: string
  public password: string
  public role: UserRole
  public is_deleted: boolean

  constructor({
    id = randomUUID(),
    name,
    password,
    role,
    is_deleted = false,
  }: {
    id?: string
    name: string
    password: string
    role: UserRole
    is_deleted?: boolean
  }) {
    this.id = id
    this.name = name
    this.password = password
    this.role = role
    this.is_deleted = is_deleted
  }
}
