import { beforeEach, describe, expect, test } from 'vitest'

import { db } from '@/api/db/client'
import { users, orders } from '@/api/db/schema'

import { ReportsController, type PeriodValue } from './reports-controller'
import { WithoutPermissionError } from '../errors/WithoutPermissionError'

describe('reports-controller', () => {
  const reportsController = new ReportsController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('getOrdersReport', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await reportsController.getOrdersReport({
        loggedUserId: 'non-existing-user-id',
        period: 'current_month',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should return empty report when there are no orders', async () => {
      const response = await reportsController.getOrdersReport({
        loggedUserId: 'test-user-id',
        period: 'current_month',
      })

      expect(response.data).toEqual({
        ordersCount: 0,
        revenue: 0,
        profit: 0,
        margin: 0,
        averageRevenuePerOrder: 0,
        orders: [],
      })
      expect(response.err).toBeNull()
    })

    test('should calculate metrics correctly for a single order', async () => {
      const orderDate = new Date()
      const dateString = orderDate.toISOString().split('T')[0]

      await db.insert(orders).values({
        id: 'order-1',
        totalPrice: 100,
        totalCostPrice: 60,
        createdAt: orderDate.toISOString(),
        draft: 0,
      })

      const response = await reportsController.getOrdersReport({
        loggedUserId: 'test-user-id',
        period: 'current_month',
      })

      expect(response.data).toEqual({
        ordersCount: 1,
        revenue: 100,
        profit: 40,
        margin: 40,
        averageRevenuePerOrder: 100,
        orders: [
          {
            date: dateString,
            totalCostPrice: 60,
            totalPrice: 100,
          },
        ],
      })
      expect(response.err).toBeNull()
    })

    test('should calculate metrics correctly for multiple orders on different days', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      await db.insert(orders).values([
        {
          id: 'order-1',
          totalPrice: 100,
          totalCostPrice: 60,
          createdAt: today.toISOString(),
          draft: 0,
        },
        {
          id: 'order-2',
          totalPrice: 200,
          totalCostPrice: 120,
          createdAt: yesterday.toISOString(),
          draft: 0,
        },
      ])

      const response = await reportsController.getOrdersReport({
        loggedUserId: 'test-user-id',
        period: 'last_7_days',
      })

      expect(response.data).toEqual({
        ordersCount: 2,
        revenue: 300,
        profit: 120,
        margin: 40,
        averageRevenuePerOrder: 150,
        orders: [
          {
            date: today.toISOString().split('T')[0],
            totalCostPrice: 60,
            totalPrice: 100,
          },
          {
            date: yesterday.toISOString().split('T')[0],
            totalCostPrice: 120,
            totalPrice: 200,
          },
        ],
      })
      expect(response.err).toBeNull()
    })

    test('should not include draft orders in calculations', async () => {
      const orderDate = new Date()

      await db.insert(orders).values([
        {
          id: 'order-1',
          totalPrice: 100,
          totalCostPrice: 60,
          createdAt: orderDate.toISOString(),
          draft: 0,
        },
        {
          id: 'order-2',
          totalPrice: 200,
          totalCostPrice: 120,
          createdAt: orderDate.toISOString(),
          draft: 1,
        },
      ])

      const response = await reportsController.getOrdersReport({
        loggedUserId: 'test-user-id',
        period: 'current_month',
      })

      expect(response.data).toEqual({
        ordersCount: 1,
        revenue: 100,
        profit: 40,
        margin: 40,
        averageRevenuePerOrder: 100,
        orders: [
          {
            date: orderDate.toISOString().split('T')[0],
            totalCostPrice: 60,
            totalPrice: 100,
          },
        ],
      })
      expect(response.err).toBeNull()
    })

    describe('period filtering', () => {
      test('current_month', async () => {
        const today = new Date()
        const pastDate = new Date(today)
        pastDate.setMonth(pastDate.getMonth() - 1)

        await db.insert(orders).values([
          {
            id: 'order-in-period',
            totalPrice: 100,
            totalCostPrice: 60,
            createdAt: today.toISOString(),
            draft: 0,
          },
          {
            id: 'order-outside-period',
            totalPrice: 200,
            totalCostPrice: 120,
            createdAt: pastDate.toISOString(),
            draft: 0,
          },
        ])

        const response = await reportsController.getOrdersReport({
          loggedUserId: 'test-user-id',
          period: 'current_month',
        })

        expect(response.data?.ordersCount).toBe(1)
        expect(response.data?.revenue).toBe(100)
        expect(response.err).toBeNull()
      })

      test.each<[PeriodValue, number]>([
        ['last_7_days', 7],
        ['last_30_days', 30],
        ['last_90_days', 90],
      ])('should correctly filter orders for %s period', async (period, daysToSubtract) => {
        const today = new Date()
        const pastDate = new Date(today)
        pastDate.setDate(pastDate.getDate() - (daysToSubtract + 5))

        await db.insert(orders).values([
          {
            id: 'order-in-period',
            totalPrice: 100,
            totalCostPrice: 60,
            createdAt: today.toISOString(),
            draft: 0,
          },
          {
            id: 'order-outside-period',
            totalPrice: 200,
            totalCostPrice: 120,
            createdAt: pastDate.toISOString(),
            draft: 0,
          },
        ])

        const response = await reportsController.getOrdersReport({
          loggedUserId: 'test-user-id',
          period,
        })

        expect(response.data?.ordersCount).toBe(1)
        expect(response.data?.revenue).toBe(100)
        expect(response.err).toBeNull()
      })
    })
  })
})
