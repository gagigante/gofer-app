import { PrismaClient, type Product } from '@prisma/client'

export class ProductsRepository {
  private readonly prisma = new PrismaClient()

  public async getProductByName(productName: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        name: productName,
      },
    })

    return product
  }

  public async getProductByBarCode(productBarCode: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
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
    const product = await this.prisma.product.create({
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
