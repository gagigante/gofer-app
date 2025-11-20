import { describe, test, expect, beforeEach } from 'vitest'

import { db } from '@/api/db/client'
import { users, customers, orders, products, ordersProducts } from '../db/schema'

import { OrdersController } from './orders-controller'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotFoundError } from '@/api/errors/NotFoundError'

import { type OrderStatus } from '../types/order-status'

describe('orders-controller', () => {
  const ordersController = new OrdersController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('listOrders', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await ordersController.listOrders({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if customerId filter is provided but customer does not exist', async () => {
      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
        filters: {
          customerId: 'non-existing-customer-id',
        },
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should return empty list when no orders exist', async () => {
      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
      })

      expect(response.data).toEqual({
        orders: [],
        total: 0,
        page: 1,
        itemsPerPage: 15,
      })
      expect(response.err).toBeNull()
    })

    test('should return orders with default pagination', async () => {
      // Create a test customer
      await db.insert(customers).values({
        id: 'test-customer-id',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      })

      // Create test orders
      await db.insert(orders).values([
        {
          id: 'order-1',
          customerId: 'test-customer-id',
          totalPrice: 100,
          totalCostPrice: 50,
          draft: 0,
        },
        {
          id: 'order-2',
          customerId: 'test-customer-id',
          totalPrice: 200,
          totalCostPrice: 100,
          draft: 0,
        },
      ])

      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
      })

      expect(response.data).toMatchObject({
        orders: expect.arrayContaining([
          expect.objectContaining({
            id: 'order-1',
            customerId: 'test-customer-id',
            totalPrice: 100,
            totalCostPrice: 50,
            draft: 0,
          }),
          expect.objectContaining({
            id: 'order-2',
            customerId: 'test-customer-id',
            totalPrice: 200,
            totalCostPrice: 100,
            draft: 0,
          }),
        ]),
        total: 2,
        page: 1,
        itemsPerPage: 15,
      })
      expect(response.err).toBeNull()
    })

    test('should filter orders by customerId', async () => {
      // Create test customers
      await db.insert(customers).values([
        {
          id: 'customer-1',
          name: 'Customer 1',
          email: 'customer1@example.com',
          phone: '1234567890',
        },
        {
          id: 'customer-2',
          name: 'Customer 2',
          email: 'customer2@example.com',
          phone: '0987654321',
        },
      ])

      // Create test orders
      await db.insert(orders).values([
        {
          id: 'order-1',
          customerId: 'customer-1',
          totalPrice: 100,
          totalCostPrice: 50,
          draft: 0,
        },
        {
          id: 'order-2',
          customerId: 'customer-2',
          totalPrice: 200,
          totalCostPrice: 100,
          draft: 0,
        },
      ])

      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
        filters: {
          customerId: 'customer-1',
        },
      })

      expect(response.data).toMatchObject({
        orders: [
          expect.objectContaining({
            id: 'order-1',
            customerId: 'customer-1',
            totalPrice: 100,
            totalCostPrice: 50,
            draft: 0,
          }),
        ],
        total: 1,
        page: 1,
        itemsPerPage: 15,
      })
      expect(response.err).toBeNull()
    })

    test('should filter orders by draft status', async () => {
      // Create test orders
      await db.insert(orders).values([
        {
          id: 'order-1',
          customerId: null,
          totalPrice: 100,
          totalCostPrice: 50,
          draft: 1,
        },
        {
          id: 'order-2',
          customerId: null,
          totalPrice: 200,
          totalCostPrice: 100,
          draft: 0,
        },
      ])

      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
        filters: {
          draft: true,
        },
      })

      expect(response.data).toMatchObject({
        orders: [
          expect.objectContaining({
            id: 'order-1',
            customerId: null,
            totalPrice: 100,
            totalCostPrice: 50,
            draft: 1,
          }),
        ],
        total: 1,
        page: 1,
        itemsPerPage: 15,
      })
      expect(response.err).toBeNull()
    })

    test('should handle custom pagination', async () => {
      // Create test orders
      await db.insert(orders).values([
        {
          id: 'order-1',
          customerId: null,
          totalPrice: 100,
          totalCostPrice: 50,
          draft: 0,
        },
        {
          id: 'order-2',
          customerId: null,
          totalPrice: 200,
          totalCostPrice: 100,
          draft: 0,
        },
        {
          id: 'order-3',
          customerId: null,
          totalPrice: 300,
          totalCostPrice: 150,
          draft: 0,
        },
      ])

      const response = await ordersController.listOrders({
        loggedUserId: 'test-user-id',
        page: 2,
        itemsPerPage: 2,
      })

      expect(response.data).toMatchObject({
        orders: [
          expect.objectContaining({
            id: 'order-3',
            totalPrice: 300,
            totalCostPrice: 150,
          }),
        ],
        total: 3,
        page: 2,
        itemsPerPage: 2,
      })
      expect(response.err).toBeNull()
    })
  })

  describe('getOrder', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await ordersController.getOrder({
        loggedUserId: 'non-existing-user-id',
        orderId: 'any-order-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if order does not exist', async () => {
      const response = await ordersController.getOrder({
        loggedUserId: 'test-user-id',
        orderId: 'non-existing-order-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should return order with customer data when order exists with customer', async () => {
      // Create a test customer
      await db.insert(customers).values({
        id: 'test-customer-id',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      })

      // Create a test order
      await db.insert(orders).values({
        id: 'test-order-id',
        customerId: 'test-customer-id',
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        obs: 'Test order observation',
        city: 'Test City',
        complement: 'Test Complement',
        neighborhood: 'Test Neighborhood',
        street: 'Test Street',
        zipcode: '12345678',
      })

      const response = await ordersController.getOrder({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id',
        customerId: 'test-customer-id',
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        obs: 'Test order observation',
        city: 'Test City',
        complement: 'Test Complement',
        neighborhood: 'Test Neighborhood',
        street: 'Test Street',
        zipcode: '12345678',
        customer: {
          id: 'test-customer-id',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
        },
        products: [],
      })
      expect(response.err).toBeNull()
    })

    test('should return order without customer data when order exists without customer', async () => {
      // Create a test order without customer
      await db.insert(orders).values({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        obs: 'Test order observation',
        city: 'Test City',
        complement: 'Test Complement',
        neighborhood: 'Test Neighborhood',
        street: 'Test Street',
        zipcode: '12345678',
      })

      const response = await ordersController.getOrder({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        obs: 'Test order observation',
        city: 'Test City',
        complement: 'Test Complement',
        neighborhood: 'Test Neighborhood',
        street: 'Test Street',
        zipcode: '12345678',
        customer: null,
        products: [],
      })
      expect(response.err).toBeNull()
    })

    test('should return order with associated products', async () => {
      // Create test products
      await db.insert(products).values([
        {
          id: 'product-1',
          name: 'Product 1',
          barCode: '123456789',
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '12345678',
          cest: '1234567',
        },
        {
          id: 'product-2',
          name: 'Product 2',
          barCode: '987654321',
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '87654321',
          cest: '7654321',
        },
      ])

      // Create a test order
      await db.insert(orders).values({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 300,
        totalCostPrice: 150,
        draft: 0,
        obs: 'Test order with products',
      })

      // Associate products with the order
      await db.insert(ordersProducts).values([
        {
          orderId: 'test-order-id',
          productId: 'product-1',
          quantity: 1,
          productPrice: 100,
          productCostPrice: 50,
          customProductPrice: 100,
          obs: 'Product 1 observation',
        },
        {
          orderId: 'test-order-id',
          productId: 'product-2',
          quantity: 1,
          productPrice: 200,
          productCostPrice: 100,
          customProductPrice: 200,
          obs: 'Product 2 observation',
        },
      ])

      const response = await ordersController.getOrder({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 300,
        totalCostPrice: 150,
        draft: 0,
        obs: 'Test order with products',
        customer: null,
        products: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-1',
            quantity: 1,
            price: 100,
            costPrice: 50,
            customPrice: 100,
            currentPrice: 100,
            currentCostPrice: 50,
            name: 'Product 1',
            barCode: '123456789',
            obs: 'Product 1 observation',
          }),
          expect.objectContaining({
            productId: 'product-2',
            quantity: 1,
            price: 200,
            costPrice: 100,
            customPrice: 200,
            currentPrice: 200,
            currentCostPrice: 100,
            name: 'Product 2',
            barCode: '987654321',
            obs: 'Product 2 observation',
          }),
        ]),
      })
      expect(response.err).toBeNull()
    })
  })

  describe('updateOrderStatus', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await ordersController.updateOrderStatus({
        loggedUserId: 'non-existing-user-id',
        orderId: 'any-order-id',
        status: 'in_progress',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if order does not exist', async () => {
      const response = await ordersController.updateOrderStatus({
        loggedUserId: 'test-user-id',
        orderId: 'non-existing-order-id',
        status: 'in_progress',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should successfully update order status', async () => {
      // Create a test order
      await db.insert(orders).values({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        status: 'pending' as OrderStatus,
      })

      const response = await ordersController.updateOrderStatus({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id',
        status: 'in_progress',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id',
        customerId: null,
        totalPrice: 100,
        totalCostPrice: 50,
        draft: 0,
        status: 'in_progress',
      })
      expect(response.err).toBeNull()

      // Verify the order was actually updated in the database
      const updatedOrder = await db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, 'test-order-id'),
      })
      expect(updatedOrder?.status).toBe('in_progress')
    })

    test('should update order status from in_progress to finished', async () => {
      // Create a test order
      await db.insert(orders).values({
        id: 'test-order-id-2',
        customerId: null,
        totalPrice: 150,
        totalCostPrice: 75,
        draft: 0,
        status: 'in_progress' as OrderStatus,
      })

      const response = await ordersController.updateOrderStatus({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id-2',
        status: 'finished',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id-2',
        status: 'finished',
      })
      expect(response.err).toBeNull()
    })

    test('should update order status from finished to delivered', async () => {
      // Create a test order
      await db.insert(orders).values({
        id: 'test-order-id-3',
        customerId: null,
        totalPrice: 200,
        totalCostPrice: 100,
        draft: 0,
        status: 'finished' as OrderStatus,
      })

      const response = await ordersController.updateOrderStatus({
        loggedUserId: 'test-user-id',
        orderId: 'test-order-id-3',
        status: 'delivered',
      })

      expect(response.data).toMatchObject({
        id: 'test-order-id-3',
        status: 'delivered',
      })
      expect(response.err).toBeNull()
    })
  })
})
