import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { Subject } from 'rxjs';
import { CustomConfigModule } from 'common/config/custom-config.module';
import { loggerConfig } from 'common/config/logger';
import { EventsModule } from 'common/events/events.module';
import { UsersModule } from 'modules/users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    CustomConfigModule,
    WinstonModule.forRoot(loggerConfig),
    EventsModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);
  private readonly shutdownListener$: Subject<void> = new Subject();

  onApplicationShutdown = async (signal: string): Promise<void> => {
    if (!signal) return;
    this.logger.log(`Detected signal: ${signal}`);

    this.shutdownListener$.next();
  };

  subscribeToShutdown = (shutdownFn: () => void): void => {
    this.shutdownListener$.subscribe(() => {
      this.logger.log('App is closed');
      shutdownFn();
    });
  };
}
