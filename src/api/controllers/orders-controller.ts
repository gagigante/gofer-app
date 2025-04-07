import { randomUUID } from 'node:crypto'

import { UsersRepository } from '../repositories/users-repository'
import { type OrderResponse, type OrderWithCustomer, OrdersRepository } from '../repositories/orders-repository'
import { CustomersRepository } from '../repositories/customers-repository'

import { AuthMiddleware } from '../middlewares/auth'

import { getOrderTemplate as getTemplateFile } from '@/api/utils/getOrderTemplate'

import { NotFoundError } from '../errors/NotFoundError'
import { InvalidParamsError } from '../errors/InvalidParamsError'

import { type Customer, type Order } from '@/api/db/schema'
import { type Response } from '../types/response'

export interface ListOrdersRequest {
  loggedUserId: string
  customerId?: string
  page?: number
  itemsPerPage?: number
}

export type ListOrdersResponse = Response<{
  orders: OrderWithCustomer[]
  page: number
  itemsPerPage: number
  total: number
}>

export interface GetOrderRequest {
  loggedUserId: string
  orderId: string
}

export type GetOrderResponse = Response<{
  id: string
  totalPrice: number | null
  createdAt: string | null
  customer: Customer | null
  obs: string | null
  products: Array<{
    productId: string | null
    quantity: number | null
    currentPrice: number | null
    price: number | null
    customPrice: number | null
    name: string | null
    barCode: string | null
  }>
}>

export interface GetOrderTemplateRequest {
  loggedUserId: string
  orderId: string
}

export type GetOrderTemplateResponse = Response<{ template: string; order: OrderResponse }>

export interface CreateOrderRequest {
  loggedUserId: string
  products: Array<{ id: string; quantity: number; customProductPrice: number }>
  customerId?: string
  obs?: string
}

export type CreateOrderResponse = Response<Order>

export interface DeleteOrderRequest {
  loggedUserId: string
  orderId: string
}

export type DeleteOrderResponse = Response<null>

export class OrdersController {
  private readonly usersRepository: UsersRepository
  private readonly ordersRepository: OrdersRepository
  private readonly customersRepository: CustomersRepository
  private readonly authMiddleware: AuthMiddleware

  constructor() {
    this.usersRepository = new UsersRepository()
    this.ordersRepository = new OrdersRepository()
    this.customersRepository = new CustomersRepository()
    this.authMiddleware = new AuthMiddleware(this.usersRepository)
  }

  public async listOrders({
    loggedUserId,
    customerId,
    page = 1,
    itemsPerPage = 15,
  }: ListOrdersRequest): Promise<ListOrdersResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    if (customerId) {
      const customer = await this.customersRepository.getCustomerById(customerId)

      if (!customer) {
        return { data: null, err: new NotFoundError() }
      }
    }

    const total = await this.ordersRepository.countOrders(customerId)
    const orders = await this.ordersRepository.getOrders(page, itemsPerPage, customerId)

    const data = { orders, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async getOrder({ loggedUserId, orderId }: GetOrderRequest): Promise<GetOrderResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const order = await this.ordersRepository.getOrderById(orderId)

    if (!order) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    return { data: order, err: null }
  }

  public async getOrderTemplate({ loggedUserId, orderId }: GetOrderTemplateRequest): Promise<GetOrderTemplateResponse> {
    const { err: authErr } = await this.authMiddleware.handle(loggedUserId)
    if (authErr) {
      return { data: null, err: authErr }
    }

    const order = await this.ordersRepository.getOrderById(orderId)

    if (!order) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    const { data: template, err } = await getTemplateFile(order)

    if (err) {
      return { data: null, err }
    }

    return { data: { template, order }, err: null }
  }

  public async createOrder({
    loggedUserId,
    products,
    customerId,
    obs,
  }: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    if (customerId) {
      const customer = await this.customersRepository.getCustomerById(customerId)

      if (!customer) {
        return { data: null, err: new NotFoundError() }
      }
    }

    let mergedProductsMap: Map<string, { id: string; quantity: number; customProductPrice: number }>

    try {
      mergedProductsMap = products.reduce<Map<string, { id: string; quantity: number; customProductPrice: number }>>(
        (acc, item) => {
          const existingProduct = acc.get(item.id)

          if (existingProduct) {
            if (existingProduct.customProductPrice !== item.customProductPrice) {
              throw new InvalidParamsError()
            }

            existingProduct.quantity += item.quantity
          } else {
            acc.set(item.id, {
              id: item.id,
              quantity: item.quantity,
              customProductPrice: item.customProductPrice,
            })
          }

          return acc
        },
        new Map(),
      )
    } catch (err) {
      return { data: null, err: err as InvalidParamsError }
    }

    let totalPrice = 0

    try {
      totalPrice = mergedProductsMap.entries().reduce((acc, [, item]) => {
        const price = Number(item.customProductPrice)
        const quantity = Number(item.quantity)

        if (isNaN(price) || isNaN(quantity)) {
          throw new InvalidParamsError()
        }

        return acc + price * quantity
      }, 0)
    } catch (err) {
      return { data: null, err: err as InvalidParamsError }
    }

    const response = await this.ordersRepository.createOrder({
      id: randomUUID(),
      products: Array.from(mergedProductsMap.values()),
      totalPrice,
      customerId,
      obs,
    })

    return { data: response, err: null }
  }

  public async deleteOrder({ loggedUserId, orderId }: DeleteOrderRequest): Promise<DeleteOrderResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const orderToDelete = await this.ordersRepository.getOrderById(orderId)

    if (!orderToDelete) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    await this.ordersRepository.deleteOrder(orderId)

    return { data: null, err: null }
  }
}
