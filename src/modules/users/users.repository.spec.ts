import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UsersEntity } from './users.entity';
import { UsersRepository } from './users.repository';

describe('UserRepository', () => {
  let userRepository: UsersRepository;
  const dataSourceMock = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    userRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('getById', () => {
    it('should return found user', async () => {
      const id = 'id';
      const user = {
        id,
        firstName: 'tester',
      };
      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user as UsersEntity);

      const foundUser = await userRepository.getById(id);
      expect(foundUser).toEqual(user);
      expect(findOneSpy).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
