import { randomUUID } from 'node:crypto'

export class User {
  public id: string
  public name: string
  public password: string

  constructor({ id = randomUUID(), name, password }: { id: string; name: string; password: string }) {
    this.id = id
    this.name = name
    this.password = password
  }
}
