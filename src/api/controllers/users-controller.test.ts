import { describe, expect, test } from 'vitest'

import { db } from '../db/client'
import { users } from '../db/schema'

import { UsersController } from './users-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { InvalidParamsError } from '../errors/InvalidParamsError'
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError'
import { NotAllowedOperationError } from '../errors/NotAllowedOperationError'

describe('users-controller', () => {
  const usersController = new UsersController()

  describe('createUser', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'non-existing-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw WithoutPermissionError if the logged user has role "operator"', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'operator',
      })

      const response = await usersController.createUser({
        loggedUserId: 'non-existing-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw InvalidParamsError if the provided name is an empty string', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: '',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw InvalidParamsError if the provided name has empty spaces', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'name with spaces',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw UserAlreadyExistsError if the provided name is already in use', async () => {
      await db.insert(users).values([
        {
          id: 'test-user-id',
          name: 'test-user',
          password: 'test-user-password',
          role: 'super-admin',
        },
        {
          id: 'user-id-2',
          name: 'user-to-be-repeated',
          password: 'user-to-be-repeated-password',
          role: 'operator',
        },
      ])

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-to-be-repeated',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(UserAlreadyExistsError)
    })

    test('should throw NotAllowedOperationError if a admin user tries to create a "super-admin" user', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-id',
        password: 'user-password',
        role: 'super-admin',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotAllowedOperationError)
    })

    test('should throw NotAllowedOperationError if a super-admin user tries to create another "super-admin" user', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-id',
        password: 'user-password',
        role: 'super-admin',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotAllowedOperationError)
    })

    test('an admin user should create a new admin user with success', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'admin',
      })

      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name', 'user-name')
      expect(response.data).toHaveProperty('role', 'admin')
      expect(response.data).not.toHaveProperty('password')
      expect(response.err).toBeNull()
    })

    test('an admin user should create a new operator user with success', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name', 'user-name')
      expect(response.data).toHaveProperty('role', 'operator')
      expect(response.data).not.toHaveProperty('password')
      expect(response.err).toBeNull()
    })

    test('a super-admin user should create a new admin user with success', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'admin',
      })

      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name', 'user-name')
      expect(response.data).toHaveProperty('role', 'admin')
      expect(response.data).not.toHaveProperty('password')
      expect(response.err).toBeNull()
    })

    test('a super-admin user should create a new operator user with success', async () => {
      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password: 'test-user-password',
        role: 'super-admin',
      })

      const response = await usersController.createUser({
        loggedUserId: 'test-user-id',
        name: 'user-name',
        password: 'user-password',
        role: 'operator',
      })

      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name', 'user-name')
      expect(response.data).toHaveProperty('role', 'operator')
      expect(response.data).not.toHaveProperty('password')
      expect(response.err).toBeNull()
    })
  })
})
