import { type Product, type Category } from '@prisma/client'

import { prisma } from '../db/client'

export class ProductsRepository {
  public async getProducts(
    name = '',
    page = 1,
    itemsPerPage = 15,
  ): Promise<Array<Product & { category: Category | null }>> {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      include: {
        category: true,
      },
      take: itemsPerPage,
      skip: page === 1 ? 0 : page,
    })

    return products
  }

  public async countProducts(name = ''): Promise<number> {
    const productsCount = await prisma.product.count({
      where: {
        name: {
          contains: name,
        },
      },
    })

    return productsCount
  }

  public async getProductByName(productName: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: {
        name: productName,
      },
    })

    return product
  }

  public async getProductByBarCode(productBarCode: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: {
        barCode: productBarCode,
      },
    })

    return product
  }

  public async createProduct({
    id,
    barCode,
    name,
    description,
    brand,
    price,
    costPrice,
    availableQuantity,
    minimumQuantity,
    categoryId,
    icms,
    ncm,
    cest,
    cestSegment,
    cestDescription,
  }: Product): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        id,
        barCode: barCode ?? '',
        name,
        description,
        brand,
        price,
        costPrice,
        availableQuantity,
        minimumQuantity,
        categoryId,
        icms,
        ncm,
        cest,
        cestSegment,
        cestDescription,
      },
    })

    return product
  }
}
