import { describe, expect, test, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'

import { db } from '../db/client'
import { users } from '../db/schema'

import { LoginController } from './login-controller'
import { IncorrectCredentialsError } from '../errors/IncorrectCredentialsError'

describe('login-controller', () => {
  const loginController = new LoginController()

  beforeEach(async () => {
    const password = await hash('test-user-password', 8)

    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password,
      role: 'super-admin',
    })
  })

  test('should throw IncorrectCredentialsError if user does not exist', async () => {
    const response = await loginController.login('non-existing-user', 'any-password')

    expect(response.data).toBeNull()
    expect(response.err).toBeInstanceOf(IncorrectCredentialsError)
  })

  test('should throw IncorrectCredentialsError if password does not match', async () => {
    const response = await loginController.login('test-user', 'wrong-password')

    expect(response.data).toBeNull()
    expect(response.err).toBeInstanceOf(IncorrectCredentialsError)
  })

  test('should login successfully with correct credentials', async () => {
    const response = await loginController.login('test-user', 'test-user-password')

    expect(response.data).toHaveProperty('id', 'test-user-id')
    expect(response.data).toHaveProperty('name', 'test-user')
    expect(response.data).toHaveProperty('role', 'super-admin')
    expect(response.data).not.toHaveProperty('password')
    expect(response.err).toBeNull()
  })
})
