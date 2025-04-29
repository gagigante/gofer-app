import { describe, expect, test } from 'vitest'
import { hash } from 'bcryptjs'

import { db } from '../db/client'
import { users } from '../db/schema'

import { AuthMiddleware } from './auth'
import { UsersRepository } from '../repositories/users-repository'
import { WithoutPermissionError } from '../errors/WithoutPermissionError'

describe('auth-middleware', () => {
  const usersRepository = new UsersRepository()
  const authMiddleware = new AuthMiddleware(usersRepository)

  test('should throw WithoutPermissionError if userId does not correspond to a user', async () => {
    const response = await authMiddleware.handle('non-existing-user-id')

    expect(response.data).toBeNull()
    expect(response.err).toBeInstanceOf(WithoutPermissionError)
  })

  test('should return user data if no required role is specified', async () => {
    const password = await hash('test-user-password', 8)

    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password,
      role: 'operator',
    })

    const response = await authMiddleware.handle('test-user-id')

    expect(response.data).toHaveProperty('id', 'test-user-id')
    expect(response.data).toHaveProperty('name', 'test-user')
    expect(response.data).toHaveProperty('role', 'operator')
    expect(response.err).toBeNull()
  })

  test('should throw WithoutPermissionError if user role level is lower than required role', async () => {
    const password = await hash('test-user-password', 8)

    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password,
      role: 'operator',
    })

    const response = await authMiddleware.handle('test-user-id', 'admin')

    expect(response.data).toBeNull()
    expect(response.err).toBeInstanceOf(WithoutPermissionError)
  })

  test('should allow access if user role level is equal to required role', async () => {
    const password = await hash('test-user-password', 8)

    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password,
      role: 'admin',
    })

    const response = await authMiddleware.handle('test-user-id', 'admin')

    expect(response.data).toHaveProperty('id', 'test-user-id')
    expect(response.data).toHaveProperty('name', 'test-user')
    expect(response.data).toHaveProperty('role', 'admin')
    expect(response.err).toBeNull()
  })

  test('should allow access if user role level is higher than required role', async () => {
    const password = await hash('test-user-password', 8)

    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password,
      role: 'super-admin',
    })

    const response = await authMiddleware.handle('test-user-id', 'admin')

    expect(response.data).toHaveProperty('id', 'test-user-id')
    expect(response.data).toHaveProperty('name', 'test-user')
    expect(response.data).toHaveProperty('role', 'super-admin')
    expect(response.err).toBeNull()
  })
})
