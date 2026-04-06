import { Injectable } from '@nestjs/common'
import { UserRole } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { User } from '../../domain/entities/user.entity'
import { IUserRepository } from '../../domain/ports/user-repository.port'

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { email } })
    return record ? this.toDomain(record) : null
  }

  async findByEmailAndCompany(
    email: string,
    companyId: string,
  ): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email_companyId: { email, companyId } },
    })
    return record ? this.toDomain(record) : null
  }

  async save(user: User): Promise<User> {
    const data = this.toPrisma(user)
    const record = await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    })
    return this.toDomain(record)
  }

  private toDomain(record: {
    id: string
    email: string
    displayName: string | null
    phone: string | null
    avatarUrl: string | null
    companyId: string | null
    role: string
    preferences: unknown
    createdAt: Date
    updatedAt: Date
  }): User {
    return User.restore({
      id: record.id,
      email: record.email,
      displayName: record.displayName ?? record.email,
      phone: record.phone,
      avatarUrl: record.avatarUrl,
      companyId: record.companyId,
      role: record.role as UserRole,
      preferences: (record.preferences as Record<string, unknown>) ?? {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  private toPrisma(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      companyId: user.companyId,
      role: user.role,
      preferences: user.preferences as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
