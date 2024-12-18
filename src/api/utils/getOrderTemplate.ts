import path from 'node:path'
import { open } from 'node:fs/promises'
import { app } from 'electron'
import Handlebars from 'handlebars'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'
import { isElectronInDev } from './isElectronInDev'

import { type Response } from '@/api/types/response'
import { type Customer } from '../db/schema'

interface Data {
  id: string
  totalPrice: number | null
  createdAt: string | null
  customer: Customer | null
  products: Array<{
    productId: string | null
    quantity: number | null
    price: number | null
    name: string | null
    barCode: string | null
    fastId: number | null
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
    }>(template)

    await file.close()

    const formattedProducts = formatProducts(data.products)
    const formattedOrderTotal = formatCurrency(parseCentsToDecimal(data.totalPrice ?? 0))

    const formattedCustomer = data.customer
      ? Object.entries(data.customer).reduce<Customer>((acc, [key, value]) => {
          return {
            ...acc,
            [key]: value ?? 'N/A',
          }
        }, {} as Customer)
      : null

    return {
      data: handlebarsTemplate({
        customer: formattedCustomer,
        products: formattedProducts,
        orderTotal: formattedOrderTotal,
      }),
      err: null,
    }
  } catch (err) {
    console.log({ err })
    return { data: null, err: err as Error }
  }
}

function formatProducts(data: Data['products']) {
  return data.map((item) => {
    return {
      ...item,
      barCode: item.barCode || 'N/A',
      price: formatCurrency(parseCentsToDecimal(item.price ?? 0)),
      total: formatCurrency(parseCentsToDecimal((item.price ?? 0) * (item.quantity ?? 0))),
    }
  })
}
