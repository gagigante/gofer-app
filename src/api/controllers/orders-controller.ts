import { randomUUID } from 'node:crypto'

import { UsersRepository } from '../repositories/users-repository'
import { OrdersRepository } from '../repositories/orders-repository'
import { ProductsRepository } from '../repositories/products-repository'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'

import { type Order } from '@/api/db/schema'
import { type Response } from '../types/response'

export interface CreateOrderRequest {
  loggedUserId: string
  products: Array<{ id: string, quantity: number }>
}

export type CreateOrderResponse = Response<Order>

export class OrdersController {
  private readonly usersRepository: UsersRepository
  private readonly ordersRepository: OrdersRepository
  private readonly productsRepository: ProductsRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.ordersRepository = new OrdersRepository()
    this.productsRepository = new ProductsRepository()
  }

  public async createOrder({ loggedUserId, products }: CreateOrderRequest): Promise<CreateOrderResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }  
   
    const mergedProductsMap = products.reduce<Map<string, { id: string, quantity: number }>>((acc, item) => {
      const existingProduct = acc.get(item.id);
    
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
      } else {
        acc.set(item.id, { id: item.id, quantity: item.quantity });
      }

      return acc;
    }, new Map())

    const orderProducts = await this.productsRepository.getProductsByIds(
      Array.from(mergedProductsMap.values()).map(item => item.id)
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
      totalPrice
    })

    return { data: response, err: null }    
  }
}