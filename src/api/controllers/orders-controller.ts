import { randomUUID } from 'node:crypto'

import { UsersRepository } from '../repositories/users-repository'
import { type OrderResponse, OrdersRepository } from '../repositories/orders-repository'
import { ProductsRepository } from '../repositories/products-repository'

import { getOrderTemplate as getTemplateFile } from '@/api/utils/getOrderTemplate'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { NotFoundError } from '../errors/NotFoundError'

import { type Order } from '@/api/db/schema'
import { type Response } from '../types/response'

export interface ListOrdersRequest {
  loggedUserId: string
  page?: number
  itemsPerPage?: number
}

export type ListOrdersResponse = Response<{
  orders: Order[]
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
  products: Array<{
    productId: string | null
    quantity: number | null
    price: number | null
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
  products: Array<{ id: string; quantity: number }>
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
  private readonly productsRepository: ProductsRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.ordersRepository = new OrdersRepository()
    this.productsRepository = new ProductsRepository()
  }

  public async listOrders({
    loggedUserId,
    page = 1,
    itemsPerPage = 15,
  }: ListOrdersRequest): Promise<ListOrdersResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const total = await this.ordersRepository.countOrders()
    const orders = await this.ordersRepository.getOrders(page, itemsPerPage)

    const data = { orders, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async getOrder({ loggedUserId, orderId }: GetOrderRequest): Promise<GetOrderResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
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
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
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

  public async createOrder({ loggedUserId, products }: CreateOrderRequest): Promise<CreateOrderResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const mergedProductsMap = products.reduce<Map<string, { id: string; quantity: number }>>((acc, item) => {
      const existingProduct = acc.get(item.id)

      if (existingProduct) {
        existingProduct.quantity += item.quantity
      } else {
        acc.set(item.id, { id: item.id, quantity: item.quantity })
      }

      return acc
    }, new Map())

    const orderProducts = await this.productsRepository.getProductsByIds(
      Array.from(mergedProductsMap.values()).map((item) => item.id),
    )

    const totalPrice = orderProducts.reduce((acc, item) => {
      const product = mergedProductsMap.get(item.id)

      if (product) {
        return acc + item.price! * product.quantity
      }

      return acc
    }, 0)

    const response = await this.ordersRepository.createOrder({
      id: randomUUID(),
      products: Array.from(mergedProductsMap.values()),
      totalPrice,
    })

    return { data: response, err: null }
  }

  public async deleteOrder({ loggedUserId, orderId }: DeleteOrderRequest): Promise<DeleteOrderResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
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
