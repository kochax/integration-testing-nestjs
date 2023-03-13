import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private userAuthService: UserAuthService,
  ) {}

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findById(id);
  }

  @Get('/:id/roles')
  async getRolesById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userAuthService.getRolesByUserId(id);
  }
}
