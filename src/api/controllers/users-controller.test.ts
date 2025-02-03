import { describe, expect, test, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'

import { db } from '../db/client'
import { users } from '../db/schema'

import { UsersController } from './users-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { InvalidParamsError } from '../errors/InvalidParamsError'
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError'
import { NotAllowedOperationError } from '../errors/NotAllowedOperationError'
import { IncorrectCredentialsError } from '../errors/IncorrectCredentialsError'
import { NotFoundError } from '../errors/NotFoundError'

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

  describe('deleteUser', () => {
    beforeEach(async () => {
      const password = await hash('test-user-password', 8)

      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password,
        role: 'super-admin',
      })
    })

    test('should throw WithoutPermissionError if loggedUserId does not correspond to a user', async () => {
      const response = await usersController.deleteUser({
        loggedUserId: 'non-existing-user-id',
        userId: 'user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw WithoutPermissionError if the logged user has role "operator"', async () => {
      await db.update(users).set({ role: 'operator' }).where(eq(users.id, 'test-user-id'))

      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided user id does not correspond to a user', async () => {
      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should throw NotAllowedOperationError on try to delete a super-admin user', async () => {
      await db.insert(users).values({
        id: 'user-to-delete',
        name: 'super-admin-user',
        password: await hash('test-user-password', 8),
        role: 'super-admin',
      })

      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'user-to-delete',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotAllowedOperationError)
    })

    test('should throw NotAllowedOperationError on try to delete yourself', async () => {
      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'test-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotAllowedOperationError)
    })

    test('should be able to delete an admin user with success', async () => {
      await db.insert(users).values({
        id: 'user-to-delete',
        name: 'super-admin-user',
        password: await hash('test-user-password', 8),
        role: 'admin',
      })

      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'user-to-delete',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const user = await db.select().from(users).where(eq(users.id, 'user-to-delete')).get()

      expect(user).toBeUndefined()
    })

    test('should be able to delete an operator user with success', async () => {
      await db.insert(users).values({
        id: 'user-to-delete',
        name: 'super-admin-user',
        password: await hash('test-user-password', 8),
        role: 'operator',
      })

      const response = await usersController.deleteUser({
        loggedUserId: 'test-user-id',
        userId: 'user-to-delete',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const user = await db.select().from(users).where(eq(users.id, 'user-to-delete')).get()

      expect(user).toBeUndefined()
    })
  })

  describe('updateUser', () => {
    beforeEach(async () => {
      const password = await hash('test-user-password', 8)

      await db.insert(users).values({
        id: 'test-user-id',
        name: 'test-user',
        password,
        role: 'super-admin',
      })
    })

    test('should throw WithoutPermissionError if loggedUserId does not correspond to a user', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'non-existing-user-id',
        updatedName: 'new-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw WithoutPermissionError if the logged user has role "operator"', async () => {
      await db.update(users).set({ role: 'operator' }).where(eq(users.id, 'test-user-id'))

      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'updated-user-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw InvalidParamsError if the provided updatedName has empty is an empty string', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw UserAlreadyExistsError if the updated name is already in use by another user', async () => {
      await db.insert(users).values({
        id: 'another-user-id',
        name: 'another-user',
        password: 'another-user-password',
        role: 'operator',
      })

      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'another-user',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(UserAlreadyExistsError)
    })

    test('should update user name successfully if no password change is requested', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
      })

      expect(response.data).toHaveProperty('id', 'test-user-id')
      expect(response.data).toHaveProperty('name', 'new-name')
      expect(response.err).toBeNull()
    })

    test('should throw IncorrectCredentialsError if current password does not match', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
        newPasswordConfirmation: 'new-password',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(IncorrectCredentialsError)
    })

    test('should throw InvalidParamsError if new password and confirmation do not match', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'test-user-password',
        newPassword: 'new-password',
        newPasswordConfirmation: 'different-password',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw InvalidParamsError if new password is not provided', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'test-user-password',
        newPassword: undefined,
        newPasswordConfirmation: 'different-password',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw InvalidParamsError if new password is an empty string', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'test-user-password',
        newPassword: ' ',
        newPasswordConfirmation: 'different-password',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw InvalidParamsError if new password confirmation is not provided', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'test-user-password',
        newPassword: 'new-password',
        newPasswordConfirmation: undefined,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should update user name and password successfully', async () => {
      const response = await usersController.updateUser({
        loggedUserId: 'test-user-id',
        updatedName: 'new-name',
        currentPassword: 'test-user-password',
        newPassword: 'new-password',
        newPasswordConfirmation: 'new-password',
      })

      expect(response.data).toHaveProperty('id', 'test-user-id')
      expect(response.data).toHaveProperty('name', 'new-name')
      expect(response.err).toBeNull()
    })
  })
})
