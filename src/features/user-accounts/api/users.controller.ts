import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UserViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersSqlQueryRepository } from '../infrastructure/query/users.sql.query-repository';

@SkipThrottle()
@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAllUsers(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute(new CreateUserCommand(body));

    return this.usersQueryRepository.getUserByIdOrNotFoundFail(userId);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
