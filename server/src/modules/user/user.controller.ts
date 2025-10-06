import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import UserEntity from '@modules/user/entities/user.entity';
import Serialize from '@decorators/serialize.decorator';
import { OrderByPipe, WherePipe } from '@nodeteam/nestjs-pipes';
import { Prisma, User } from '@prisma/client';
import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import ApiOkBaseResponse from '@decorators/api-ok-base-response.decorator';
import ApiBaseResponses from '@decorators/api-base-response.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiBaseResponses()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({ name: 'where', required: false, type: 'string' })
  @ApiQuery({ name: 'orderBy', required: false, type: 'string' })
  @ApiOkBaseResponse({ dto: UserEntity, isArray: true })
  @Serialize(UserEntity)
  async findAll(
    @Query('where', WherePipe) where?: Prisma.UserWhereInput,
    @Query('orderBy', OrderByPipe)
    orderBy?: Prisma.UserOrderByWithRelationInput,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<PaginatorTypes.PaginatedResult<User>> {
    return this.userService.findAll(where, orderBy, { page, perPage });
  }
}
