import { randomUUID } from 'node:crypto'
import { type UserRole } from '../types/user-role'

export class User {
  public id: string
  public name: string
  public password: string
  public role: UserRole

  constructor({
    id = randomUUID(),
    name,
    password,
    role,
  }: {
    id?: string
    name: string
    password: string
    role: UserRole
  }) {
    this.id = id
    this.name = name
    this.password = password
    this.role = role
  }
}
