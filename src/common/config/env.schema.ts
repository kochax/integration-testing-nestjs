import { Expose, plainToInstance, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, validateSync } from 'class-validator';

export class EnvironmentVariablesSchema {
  @IsNotEmpty()
  @Expose()
  public CLIENT_URL = 'http://localhost:3000';

  @IsNotEmpty()
  @Expose()
  public COOKIE_SECRET = 'secret';

  @Expose()
  @IsNotEmpty()
  public DATABASE_NAME = 'placeholder';

  @Expose()
  @IsNotEmpty()
  public DATABASE_HOSTNAME = 'placeholder';

  @Expose()
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  public DATABASE_PORT = 5432;

  @Expose()
  @IsNotEmpty()
  public DATABASE_USERNAME = 'placeholder';

  @Expose()
  @IsNotEmpty()
  public DATABASE_PASSWORD = 'placeholder';

  @IsInt()
  @Expose()
  @Type(() => Number)
  public PORT = 3000;

  @Expose()
  @IsNotEmpty()
  public USER_SERVICE_URL = 'https://jsonplaceholder.typicode.com';
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(
    EnvironmentVariablesSchema,
    {
      ...new EnvironmentVariablesSchema(),
      ...config,
    },
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
