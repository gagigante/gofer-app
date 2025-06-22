import { sub } from 'date-fns'

import { UsersRepository } from '../repositories/users-repository'
import { OrdersRepository } from '../repositories/orders-repository'

import { AuthMiddleware } from '../middlewares/auth'

import { type Order } from '../db/schema'
import { type Response } from '../types/response'

export type PeriodValue = 'current_month' | 'last_7_days' | 'last_30_days' | 'last_90_days'

export interface GetOrdersReportRequest {
  loggedUserId: string
  period: PeriodValue
}

type OrdersValuePerDay = {
  totalCostPrice: number
  totalPrice: number
  date: string
}

export type GetOrdersReportResponse = Response<{
  ordersCount: number
  revenue: number
  profit: number
  margin: number
  averageRevenuePerOrder: number
  orders: Array<OrdersValuePerDay>
}>

export class ReportsController {
  private readonly usersRepository: UsersRepository
  private readonly ordersRepository: OrdersRepository
  private readonly authMiddleware: AuthMiddleware

  constructor() {
    this.usersRepository = new UsersRepository()
    this.ordersRepository = new OrdersRepository()
    this.authMiddleware = new AuthMiddleware(this.usersRepository)
  }

  public async getOrdersReport({ loggedUserId, period }: GetOrdersReportRequest): Promise<GetOrdersReportResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const [startDate, endDate] = this.getPeriodStartDate(period)

    const ordersCount = await this.ordersRepository.countOrders({
      draft: false,
      startDate,
      endDate,
    })

    const orders = await this.ordersRepository.getOrders(1, ordersCount, {
      draft: false,
      startDate,
      endDate,
    })

    const { revenue, profit } = orders.reduce<{
      revenue: number
      profit: number
    }>(
      (acc, order) => {
        acc.revenue += order.totalPrice
        acc.profit += order.totalPrice - order.totalCostPrice

        return acc
      },
      { revenue: 0, profit: 0 },
    )

    const ordersByDateArray = this.groupOrdersByDate(orders)

    return {
      data: {
        ordersCount,
        revenue,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
        averageRevenuePerOrder: orders.length > 0 ? revenue / orders.length : 0,
        orders: ordersByDateArray,
      },
      err: null,
    }
  }

  /**
   * @returns [startDate, endDate]
   */
  private getPeriodStartDate(period: PeriodValue): [Date, Date] {
    const now = new Date()

    if (period === 'current_month') {
      return [new Date(now.getFullYear(), now.getMonth(), 1), now]
    }

    const SUBTRACT_DAYS: Record<Exclude<PeriodValue, 'current_month'>, number> = {
      last_7_days: 7,
      last_30_days: 30,
      last_90_days: 90,
    } as const

    const startDate = sub(now, { days: SUBTRACT_DAYS[period] })

    return [startDate, now]
  }

  private groupOrdersByDate(orders: Order[]): OrdersValuePerDay[] {
    const ordersByDateMap = orders.reduce((acc, order) => {
      if (!order.createdAt) return acc

      const date = order.createdAt.includes('T') ? order.createdAt.split('T')[0] : order.createdAt.split(' ')[0]

      const dayOrdersSummary = acc.get(date)

      if (!dayOrdersSummary) {
        acc.set(date, {
          totalCostPrice: order.totalCostPrice,
          totalPrice: order.totalPrice,
        })
      } else {
        acc.set(date, {
          totalCostPrice: dayOrdersSummary.totalCostPrice + order.totalCostPrice,
          totalPrice: dayOrdersSummary.totalPrice + order.totalPrice,
        })
      }

      return acc
    }, new Map<string, { totalCostPrice: number; totalPrice: number }>())

    const ordersByDateArray: OrdersValuePerDay[] = Array.from(ordersByDateMap.entries()).map(([date, summary]) => {
      return {
        date,
        totalCostPrice: summary.totalCostPrice,
        totalPrice: summary.totalPrice,
      }
    })

    return ordersByDateArray
  }
}
