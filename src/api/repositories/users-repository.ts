import { PrismaClient, type User } from '@prisma/client'
import { type UserRole } from '../types/user-role'

export class UsersRepository {
  private readonly prisma = new PrismaClient()

  public async getUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    return user
  }

  public async getUserByName(name: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { name },
    })

    return user
  }

  public async getUsers(name = '', page = 1, itemsPerPage = 15): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      take: itemsPerPage,
      skip: page === 1 ? 0 : page,
    })

    return users
  }

  public async countUsers(name = ''): Promise<number> {
    const usersCount = await this.prisma.user.count({
      where: {
        name: {
          contains: name,
        },
      },
    })

    return usersCount
  }

  public async createUser({ id, name, password, role }: User & { role: UserRole }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        id,
        name,
        password,
        role,
      },
    })

    return user
  }

  public async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    })
  }

  public async updateUser(userId: string, name: string, newPassword?: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        password: newPassword,
      },
    })

    return user
  }
}
