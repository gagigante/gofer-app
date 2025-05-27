import { describe, test, expect, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '@/api/db/client'
import { Customer, customers, users } from '@/api/db/schema'

import { CustomersController } from './customers-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { NotFoundError } from '../errors/NotFoundError'
import { InvalidParamsError } from '../errors/InvalidParamsError'

describe('customers-controller', () => {
  const customersController = new CustomersController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('listCustomers', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await customersController.listCustomers({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should be able to list customers', async () => {
      const CUSTOMERS: Customer[] = [
        {
          id: 'customer-3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '5555555555',
          cpf: null,
          rg: null,
          cnpj: null,
          ie: null,
          zipcode: null,
          city: null,
          complement: null,
          street: null,
          neighborhood: null,
        },
        {
          id: 'customer-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '0987654321',
          cpf: null,
          rg: null,
          cnpj: null,
          ie: null,
          zipcode: null,
          city: null,
          complement: null,
          street: null,
          neighborhood: null,
        },
        {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          cpf: null,
          rg: null,
          cnpj: null,
          ie: null,
          zipcode: null,
          city: null,
          street: null,
          neighborhood: null,
          complement: null,
        },
      ]

      await db.insert(customers).values(CUSTOMERS)

      let response = await customersController.listCustomers({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.customers).length(3)
      expect(response.data?.customers).toStrictEqual(CUSTOMERS)
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(3)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()

      response = await customersController.listCustomers({
        loggedUserId: 'test-user-id',
        page: 1,
        itemsPerPage: 2,
      })

      expect(response.data?.customers).length(2)
      expect(response.data?.customers).toStrictEqual(CUSTOMERS.slice(0, 2))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(3)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()
    })

    test('should be able to list customers with filter by name', async () => {
      const CUSTOMERS: Customer[] = [
        {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          cpf: null,
          rg: null,
          cnpj: null,
          ie: null,
          zipcode: null,
          city: null,
          street: null,
          neighborhood: null,
          complement: null,
        },
        {
          id: 'customer-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '0987654321',
          cpf: null,
          rg: null,
          cnpj: null,
          ie: null,
          zipcode: null,
          city: null,
          street: null,
          neighborhood: null,
          complement: null,
        },
      ]

      await db.insert(customers).values(CUSTOMERS)

      const response = await customersController.listCustomers({
        loggedUserId: 'test-user-id',
        name: 'John',
      })

      expect(response.data?.customers).length(1)
      expect(response.data?.customers).toStrictEqual([CUSTOMERS[0]])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(1)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })
  })

  describe('getCustomer', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await customersController.getCustomer({
        loggedUserId: 'non-existing-user-id',
        customerId: 'customer-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided customer id does not correspond to an existing customer', async () => {
      const response = await customersController.getCustomer({
        loggedUserId: 'test-user-id',
        customerId: 'non-existing-customer-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to get a customer by its ID', async () => {
      const customer: Customer = {
        id: 'customer-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        complement: null,
        street: null,
        neighborhood: null,
      }

      await db.insert(customers).values(customer)

      const response = await customersController.getCustomer({
        loggedUserId: 'test-user-id',
        customerId: 'customer-id',
      })

      expect(response.data).toStrictEqual(customer)
      expect(response.err).toBeNull()
    })
  })

  describe('createCustomer', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await customersController.createCustomer({
        loggedUserId: 'non-existing-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should create a customer with success', async () => {
      const response = await customersController.createCustomer({
        loggedUserId: 'test-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      })

      expect(response.data?.name).toBe('John Doe')
      expect(response.data?.email).toBe('john@example.com')
      expect(response.data?.phone).toBe('1234567890')
      expect(response.err).toBeNull()
    })

    test('should reject empty customer names', async () => {
      const response = await customersController.createCustomer({
        loggedUserId: 'test-user-id',
        name: '',
        email: 'john@example.com',
        phone: '1234567890',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should reject invalid email format', async () => {
      const response = await customersController.createCustomer({
        loggedUserId: 'test-user-id',
        name: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })
  })

  describe('deleteCustomer', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await customersController.deleteCustomer({
        loggedUserId: 'non-existing-user-id',
        customerId: 'customer-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided customer id does not correspond to an existing customer', async () => {
      const response = await customersController.deleteCustomer({
        loggedUserId: 'test-user-id',
        customerId: 'customer-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to delete a customer', async () => {
      await db.insert(customers).values({
        id: 'customer-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      })

      const response = await customersController.deleteCustomer({
        loggedUserId: 'test-user-id',
        customerId: 'customer-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const customer = await db.select().from(customers).where(eq(customers.id, 'customer-id')).get()

      expect(customer).toBeUndefined()
    })
  })

  describe('updateCustomer', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await customersController.updateCustomer({
        loggedUserId: 'non-existing-user-id',
        id: 'customer-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the customer does not exist', async () => {
      const response = await customersController.updateCustomer({
        loggedUserId: 'test-user-id',
        id: 'non-existing-customer-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to update a customer', async () => {
      await db.insert(customers).values({
        id: 'customer-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      const response = await customersController.updateCustomer({
        loggedUserId: 'test-user-id',
        id: 'customer-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      expect(response.data).toStrictEqual({
        id: 'customer-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })
      expect(response.err).toBeNull()
    })

    test('should reject empty customer names during update', async () => {
      await db.insert(customers).values({
        id: 'customer-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      const response = await customersController.updateCustomer({
        loggedUserId: 'test-user-id',
        id: 'customer-id',
        name: '',
        email: 'updated@example.com',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should reject invalid email format during update', async () => {
      await db.insert(customers).values({
        id: 'customer-id',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      const response = await customersController.updateCustomer({
        loggedUserId: 'test-user-id',
        id: 'customer-id',
        name: 'Updated Name',
        email: 'invalid-email',
        phone: '9876543210',
        cpf: null,
        rg: null,
        cnpj: null,
        ie: null,
        zipcode: null,
        city: null,
        street: null,
        neighborhood: null,
        complement: null,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })
  })
})
