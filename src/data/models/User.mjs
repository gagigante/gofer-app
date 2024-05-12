import { randomUUID }  from 'node:crypto';

export class User {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.name
   * @param {string} data.password
   */
  constructor({ id = randomUUID(), name, password }) {
    this.id = id
    this.name = name
    this.password = password
  }
}
