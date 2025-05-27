import { randomUUID } from 'node:crypto'
import * as z from 'zod'

import { UsersRepository } from '../repositories/users-repository'
import { CustomersRepository } from '@/api/repositories/customers-repository'

import { InvalidParamsError } from '@/api/errors/InvalidParamsError'
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

export interface GetCustomerRequest {
  loggedUserId: string
  customerId: string
}

export type GetCustomerResponse = Response<Customer>

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

  public async getCustomer({ loggedUserId, customerId }: GetCustomerRequest): Promise<GetCustomerResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const customer = await this.customersRepository.getCustomerById(customerId)

    if (!customer) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    return { data: customer, err: null }
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

    const customerWithTrimmedFields = Object.entries(newCustomer).reduce(
      (acc, [key, value]) => {
        acc[key as keyof Omit<NewCustomer, 'id'>] = value?.trim() || null

        return acc
      },
      {} as Omit<NewCustomer, 'id'>,
    )

    const response = this.validateCustomerData(customerWithTrimmedFields)
    if (!response) {
      const err = new InvalidParamsError()

      return { data: null, err }
    }

    const { data: createdCustomer, err } = await this.customersRepository.createCustomer({
      id: randomUUID(),
      ...customerWithTrimmedFields,
    })

    if (err) {
      return { data: null, err }
    }

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

  public async updateCustomer({ loggedUserId, ...customer }: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const customerToUpdate = await this.customersRepository.getCustomerById(customer.id)

    if (!customerToUpdate) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    const customerWithTrimmedFields = Object.entries(customer).reduce(
      (acc, [key, value]) => {
        acc[key as keyof Omit<NewCustomer, 'id'>] = value?.trim() || null

        return acc
      },
      {} as Omit<NewCustomer, 'id'>,
    )

    const response = this.validateCustomerData(customerWithTrimmedFields)
    if (!response) {
      const err = new InvalidParamsError()

      return { data: null, err }
    }

    const { data: updatedCustomer, err } = await this.customersRepository.updateCustomer(customer)

    if (err) {
      return { data: null, err }
    }

    return { data: updatedCustomer, err: null }
  }

  private validateCustomerData(data: Omit<NewCustomer, 'id'>): boolean {
    const schema = z.object({
      name: z.string().min(1),
      rg: z.union([z.string().nullable(), z.undefined()]),
      cpf: z.union([z.string().nullable(), z.undefined()]),
      cnpj: z.union([z.string().nullable(), z.undefined()]),
      ie: z.union([z.string().nullable(), z.undefined()]),
      email: z.union([z.string().email().nullable(), z.undefined()]),
      phone: z.union([z.string().nullable(), z.undefined()]),
      zipcode: z.union([z.string().nullable(), z.undefined()]),
      city: z.union([z.string().nullable(), z.undefined()]),
      street: z.union([z.string().nullable(), z.undefined()]),
      neighborhood: z.union([z.string().nullable(), z.undefined()]),
      complement: z.union([z.string().nullable(), z.undefined()]),
    })

    return schema.safeParse(data).success
  }
}
