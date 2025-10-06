import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/user.repository';
import { Prisma, User } from '@prisma/client';
import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @desc Find all users with pagination
   * @param where
   * @param orderBy
   */
  findAll(
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    optionsPage: { page: number; perPage: number },
  ): Promise<PaginatorTypes.PaginatedResult<User>> {
    return this.userRepository.findAll(where, orderBy, optionsPage);
  }
}
