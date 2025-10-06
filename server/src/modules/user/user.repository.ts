import { PrismaService } from '@providers/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import { Prisma, User } from '@prisma/client';
import UserEntity from './entities/user.entity';

@Injectable()
export class UserRepository {
  private readonly paginate: PaginatorTypes.PaginateFunction;

  constructor(private prisma: PrismaService) {
    /**
     * @desc Create a paginate function
     * @param model
     * @param options
     * @returns Promise<PaginatorTypes.PaginatedResult<T>>
     */
    this.paginate = paginator({
      page: 1,
      perPage: 10,
    });
  }

  async findOne(params: Prisma.UserFindFirstArgs): Promise<UserEntity | null> {
    const { select, ...rest } = params;
    const user = await this.prisma.user.findFirst({
      ...rest,
      select,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    optionsPage: { page: number; perPage: number },
  ): Promise<PaginatorTypes.PaginatedResult<User>> {
    return this.paginate(
      this.prisma.user,
      {
        where,
        orderBy,
      },
      {
        page: optionsPage.page,
        perPage: optionsPage.perPage,
      },
    );
  }
}
