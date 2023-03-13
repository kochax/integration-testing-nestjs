import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersEntity } from './users.entity';
import { UsersRepository } from './users.repository';
import { UserAuthService } from './user-auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), HttpModule.register({})],
  providers: [UsersService, UsersRepository, UserAuthService],
  controllers: [UsersController],
})
export class UsersModule {}
