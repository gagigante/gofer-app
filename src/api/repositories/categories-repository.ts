import { type Category } from '@prisma/client'

import { prisma } from '../db/client'

export class CategoriesRepository {
  public async getCategories(
    name = '',
    page = 1,
    itemsPerPage = 15,
  ): Promise<Array<Category & { _count: { products: number } }>> {
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      include: {
        _count: { select: { products: true } },
      },
      take: itemsPerPage,
      skip: page === 1 ? 0 : (page - 1) * itemsPerPage,
    })

    return categories
  }

  public async countCategories(name = ''): Promise<number> {
    const categoriesCount = await prisma.category.count({
      where: {
        name: {
          contains: name,
        },
      },
    })

    return categoriesCount
  }

  public async getCategoryById(categoryId: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    return category
  }

  public async getCategoryByName(categoryName: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    })

    return category
  }

  public async createCategory({
    id,
    name,
    description,
    productsIds = [],
  }: Omit<Category, 'products'> & { productsIds?: string[] }): Promise<Category> {
    const categoryProductsIds = productsIds.map((id) => ({ id }))

    const category = await prisma.category.create({
      data: {
        id,
        name,
        description,
        products: {
          connect: categoryProductsIds,
        },
      },
    })

    return category
  }

  public async updateCategory({ id, name, description }: Category): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    return category
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    await prisma.category.delete({
      where: { id: categoryId },
    })
  }
}
