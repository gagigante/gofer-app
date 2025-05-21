import path from 'node:path'
import { open } from 'node:fs/promises'
import { app } from 'electron'
import Handlebars from 'handlebars'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'
import { isElectronInDev } from './isElectronInDev'

import { type Response } from '@/api/types/response'
import { type Customer } from '../db/schema'

interface Address {
  city: string
  complement: string
  neighborhood: string
  street: string
  zipcode: string
}

interface Data {
  id: string
  totalPrice: number | null
  createdAt: string | null
  customer: Customer | null
  obs: string | null
  city: string | null
  complement: string | null
  neighborhood: string | null
  street: string | null
  zipcode: string | null
  products: Array<{
    productId: string | null
    quantity: number | null
    price: number | null
    customPrice: number | null
    name: string | null
    barCode: string | null
    fastId: number | null
    obs: string | null
  }>
}

export async function getOrderTemplate(data: Data): Promise<Response<string>> {
  const isDev = isElectronInDev()
  const templatePath = isDev
    ? path.join(app.getAppPath(), 'src', 'api', 'templates', 'order-template.html')
    : path.join(process.resourcesPath, 'templates', 'order-template.html')

  try {
    const file = await open(templatePath)
    const fileBuf = await file.readFile()

    const template = fileBuf.toString()
    const handlebarsTemplate = Handlebars.compile<{
      customer: Customer | null
      products: ReturnType<typeof formatProducts>
      orderTotal: string
      orderObs: string | null
      address: Address
    }>(template)

    await file.close()

    const formattedProducts = formatProducts(data.products)
    const formattedOrderTotal = formatCurrency(parseCentsToDecimal(data.totalPrice ?? 0))

    const formattedCustomer = data.customer
      ? Object.entries(data.customer).reduce<Customer>((acc, [key, value]) => {
          return {
            ...acc,
            [key]: value || 'N/A',
          }
        }, {} as Customer)
      : null

    return {
      data: handlebarsTemplate({
        customer: formattedCustomer,
        address: formatAddress(data),
        orderObs: data.obs,
        products: formattedProducts,
        orderTotal: formattedOrderTotal,
      }),
      err: null,
    }
  } catch (err) {
    return { data: null, err: err as Error }
  }
}

function formatAddress(data: Data): Address {
  return {
    city: data?.city || 'N/A',
    complement: data?.complement || 'N/A',
    neighborhood: data?.neighborhood || 'N/A',
    street: data?.street || 'N/A',
    zipcode: data?.zipcode || 'N/A',
  }
}

function formatProducts(data: Data['products']) {
  return data.map((item) => {
    return {
      ...item,
      barCode: item.barCode || 'N/A',
      price: formatCurrency(parseCentsToDecimal(item.customPrice ?? item.price ?? 0)),
      total: formatCurrency(parseCentsToDecimal((item.customPrice ?? item.price ?? 0) * (item.quantity ?? 0))),
    }
  })
}
