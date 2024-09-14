import { PrismaClient, type Category } from '@prisma/client'

export class CategoriesRepository {
  private readonly prisma = new PrismaClient()

  public async getCategories(name = '', page = 1, itemsPerPage = 15): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      take: itemsPerPage,
      skip: page === 1 ? 0 : page,
    })

    return categories
  }

  public async countCategories(name = ''): Promise<number> {
    const categoriesCount = await this.prisma.category.count({
      where: {
        name: {
          contains: name,
        },
      },
    })

    return categoriesCount
  }

  public async getCategoryById(categoryId: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    return category
  }

  public async getCategoryByName(categoryName: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
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

    const category = await this.prisma.category.create({
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
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    return category
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id: categoryId },
    })
  }
}
