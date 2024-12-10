import { randomUUID } from 'node:crypto'

import { UsersRepository } from '../repositories/users-repository'
import { CustomersRepository } from '@/api/repositories/customers-repository'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotFoundError } from '@/api/errors/NotFoundError'

import { type Response } from '@/api/types/response'
import { type Customer, type NewCustomer } from '../db/schema'

export interface ListCustomersRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListCustomersResponse = Response<{
  customers: Customer[]
  page: number
  itemsPerPage: number
  total: number
}>

export type CreateCustomerRequest = {
  loggedUserId: string
} & Omit<NewCustomer, 'id'>

export type CreateCustomerResponse = Response<Customer>

export interface DeleteCustomerRequest {
  loggedUserId: string
  customerId: string
}

export type DeleteCustomerResponse = Response<null>

export type UpdateCustomerRequest = {
  loggedUserId: string
} & Customer

export type UpdateCustomerResponse = Response<Customer>

export class CustomersController {
  private readonly customersRepository: CustomersRepository
  private readonly usersRepository: UsersRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.customersRepository = new CustomersRepository()
  }

  public async listCustomers({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListCustomersRequest): Promise<ListCustomersResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const total = await this.customersRepository.countCustomers(name)
    const customers = await this.customersRepository.getCustomers(name, page, itemsPerPage)

    const data = { customers, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async createCustomer({
    loggedUserId,
    ...newCustomer
  }: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const createdCustomer = await this.customersRepository.createCustomer({
      id: randomUUID(),
      ...newCustomer,
    })

    return { data: createdCustomer, err: null }
  }

  public async deleteCustomer({ loggedUserId, customerId }: DeleteCustomerRequest): Promise<DeleteCustomerResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const customerToDelete = await this.customersRepository.getCustomerById(customerId)

    if (!customerToDelete) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    await this.customersRepository.deleteCustomer(customerId)

    return { data: null, err: null }
  }

  public async updateCustomer({
    loggedUserId,
    ...updatedCustomer
  }: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const response = await this.customersRepository.updateCustomer(updatedCustomer)

    return { data: response, err: null }
  }
}
