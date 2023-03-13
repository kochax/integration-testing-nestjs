import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { setupApiDocs } from 'common/config/api-docs';
import { loggerConfig } from 'common/config/logger';
import { HttpExceptionFilter } from 'common/filters';
import { loggerMiddleware } from 'common/middlewares';
import { CustomValidationPipe } from 'common/pipes';
import { AppModule } from 'modules/app/app.module';
import { CustomConfigService } from 'common/config/custom-config.service';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(CustomConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.CLIENT_URL,
  });
  app.enableShutdownHooks();
  app.get(AppModule).subscribeToShutdown(() => app.close());

  app.use(cookieParser(configService.COOKIE_SECRET));
  app.use(loggerMiddleware);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new CustomValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    }),
  );
  setupApiDocs(app);

  await app.listen(configService.PORT).then(() => {
    logger.log(`Server is running on port ${configService.PORT}`);
  });
}

bootstrap();

process.on(
  'unhandledRejection',
  function handleUnhandledRejection(err: Error): void {
    const logger = new Logger(handleUnhandledRejection.name);
    logger.error(err.stack);
  },
);
