import { randomUUID } from 'node:crypto'

import { UsersRepository } from '../repositories/users-repository'
import { type OrderResponse, type OrderWithCustomer, OrdersRepository } from '../repositories/orders-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { CustomersRepository } from '../repositories/customers-repository'

import { AuthMiddleware } from '../middlewares/auth'

import { getOrderTemplate as getTemplateFile } from '@/api/utils/getOrderTemplate'

import { NotFoundError } from '../errors/NotFoundError'
import { InvalidParamsError } from '../errors/InvalidParamsError'

import { type Customer, type Order } from '@/api/db/schema'
import { type Response } from '../types/response'
import { type OrderStatus } from '../types/order-status'

export interface ListOrdersRequest {
  loggedUserId: string
  page?: number
  itemsPerPage?: number
  filters?: {
    customerId?: string
    draft?: boolean
  }
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

export type GetOrderResponse = Response<
  Order & {
    customer: Customer | null
    products: Array<{
      productId: string | null
      fastId: number | null
      quantity: number | null
      costPrice: number | null
      price: number | null
      customPrice: number | null
      currentPrice: number | null
      currentCostPrice: number | null
      name: string | null
      barCode: string | null
      obs: string | null
    }>
  }
>

export interface GetOrderTemplateRequest {
  loggedUserId: string
  orderId: string
}

export type GetOrderTemplateResponse = Response<{ template: string; order: OrderResponse }>

export interface CreateOrderRequest {
  loggedUserId: string
  products: Array<{ id: string; quantity: number; customProductPrice: number; obs?: string }>
  customerId?: string
  obs?: string
  city?: string
  complement?: string
  neighborhood?: string
  street?: string
  zipcode?: string
  draft?: boolean
}

export type CreateOrderResponse = Response<Order>

export interface DeleteOrderRequest {
  loggedUserId: string
  orderId: string
}

export interface UpdateOrderStatusRequest {
  loggedUserId: string
  orderId: string
  status: OrderStatus
}

export type UpdateOrderStatusResponse = Response<Order>

export type DeleteOrderResponse = Response<null>

export class OrdersController {
  private readonly usersRepository: UsersRepository
  private readonly ordersRepository: OrdersRepository
  private readonly customersRepository: CustomersRepository
  private readonly productsRepository: ProductsRepository
  private readonly authMiddleware: AuthMiddleware

  constructor() {
    this.usersRepository = new UsersRepository()
    this.ordersRepository = new OrdersRepository()
    this.customersRepository = new CustomersRepository()
    this.productsRepository = new ProductsRepository()
    this.authMiddleware = new AuthMiddleware(this.usersRepository)
  }

  public async listOrders({
    loggedUserId,
    page = 1,
    itemsPerPage = 15,
    filters = {},
  }: ListOrdersRequest): Promise<ListOrdersResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    if (filters.customerId) {
      const customer = await this.customersRepository.getCustomerById(filters.customerId)

      if (!customer) {
        return { data: null, err: new NotFoundError() }
      }
    }

    const total = await this.ordersRepository.countOrders(filters)
    const orders = await this.ordersRepository.getOrders(page, itemsPerPage, filters)

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
    city,
    complement,
    neighborhood,
    street,
    zipcode,
    draft = false,
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

    const mergedProducts = new Map<string, { id: string; quantity: number; customProductPrice: number; obs?: string }>()

    for (const item of products) {
      const existing = mergedProducts.get(item.id)

      if (existing) {
        if (existing.customProductPrice !== item.customProductPrice) {
          throw new InvalidParamsError()
        }

        existing.quantity += item.quantity
      } else {
        mergedProducts.set(item.id, { ...item })
      }
    }

    const orderProducts = await this.productsRepository.getProducts(1, mergedProducts.size, {
      ids: Array.from(mergedProducts.keys()),
    })

    if (orderProducts.length !== mergedProducts.size) {
      return { data: null, err: new InvalidParamsError() }
    }

    const productLookup = new Map(orderProducts.map((p) => [p.id, p]))

    let totalPrice = 0
    let totalCostPrice = 0

    const validatedProducts = new Map<
      string,
      { id: string; quantity: number; customProductPrice: number; obs?: string }
    >()

    for (const [productId, product] of mergedProducts) {
      const dbProduct = productLookup.get(productId)

      if (!dbProduct) {
        throw new InvalidParamsError()
      }

      const costPrice = Number(dbProduct.costPrice)
      const price = Number(product.customProductPrice)
      const quantity = Number(product.quantity)

      if (isNaN(price) || isNaN(costPrice) || isNaN(quantity)) {
        throw new InvalidParamsError()
      }

      totalPrice += price * quantity
      totalCostPrice += costPrice * quantity
      validatedProducts.set(productId, product)
    }

    const response = await this.ordersRepository.createOrder({
      id: randomUUID(),
      products: Array.from(validatedProducts.values()),
      totalPrice,
      totalCostPrice,
      customerId,
      obs,
      city,
      complement,
      neighborhood,
      street,
      zipcode,
      draft: draft ? 1 : 0,
    })

    return { data: response, err: null }
  }

  public async updateOrderStatus({
    loggedUserId,
    orderId,
    status,
  }: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const order = await this.ordersRepository.getOrderById(orderId)

    if (!order) {
      return { data: null, err: new NotFoundError() }
    }

    const response = await this.ordersRepository.updateOrder(orderId, {
      status,
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
