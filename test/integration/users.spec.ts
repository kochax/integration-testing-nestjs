import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Repository } from 'typeorm';
import { AppModule } from 'modules/app/app.module';
import { UsersEntity } from 'modules/users/users.entity';
import * as userRolesResponse from './mocks/data/user-roles.json';
import { createDummyAuthServiceServer } from './mocks/dummy-auth-service-server';

describe('UsersController (integration)', () => {
  let app: INestApplication;
  let dummyAuthServiceServerClose: () => void;
  let postgresContainer: StartedTestContainer;
  let usersRepository: Repository<UsersEntity>;
  const databaseConfig = {
    databaseName: 'nestjs-starter-db',
    databaseUsername: 'user',
    databasePassword: 'some-r4ndom-pasS',
    databasePort: 5432,
  };

  beforeAll(async () => {
    const dummyAuthServiceServer = await createDummyAuthServiceServer();
    dummyAuthServiceServerClose = dummyAuthServiceServer.close;

    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: databaseConfig.databaseUsername,
        POSTGRES_PASSWORD: databaseConfig.databasePassword,
        POSTGRES_DB: databaseConfig.databaseName,
      })
      .withExposedPorts(databaseConfig.databasePort)
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string): string => {
          const map: Record<string, string | undefined> = process.env;
          map.USER_AUTH_SERVICE_URL = dummyAuthServiceServer.url;

          map.DATABASE_HOSTNAME = postgresContainer.getHost();
          map.DATABASE_PORT = `${postgresContainer.getMappedPort(
            databaseConfig.databasePort,
          )}`;
          map.DATABASE_NAME = databaseConfig.databaseName;
          map.DATABASE_USERNAME = databaseConfig.databaseUsername;
          map.DATABASE_PASSWORD = databaseConfig.databasePassword;

          return map[key] || '';
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    usersRepository = app.get(getRepositoryToken(UsersEntity));
    await app.init();
  });

  beforeEach(async () => {
    await usersRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
    dummyAuthServiceServerClose();
    await postgresContainer.stop();
  });

  describe('[GET] /users/:id', () => {
    it('should return found user', async () => {
      const userId = 'b618445a-0089-43d5-b9ca-e6f2fc29a11d';
      const userDetails = {
        id: userId,
        firstName: 'tester',
      };
      const newUser = usersRepository.create(userDetails);
      await usersRepository.save(newUser);

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toEqual(userDetails);
        });
    });

    it('should return 404 error when user is not found', async () => {
      const userId = 'b618445a-0089-43d5-b9ca-e6f2fc29a11d';

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return user roles from user auth service', async () => {
      const userId = 'b618445a-0089-43d5-b9ca-e6f2fc29a11d';

      return request(app.getHttpServer())
        .get(`/users/${userId}/roles`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toEqual(userRolesResponse);
        });
    });
  });
});
