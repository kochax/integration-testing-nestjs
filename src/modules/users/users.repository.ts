import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersRepository extends Repository<UsersEntity> {
  constructor(private dataSource: DataSource) {
    super(UsersEntity, dataSource.createEntityManager());
  }

  async getById(id: string) {
    return this.findOne({ where: { id } });
  }
}
