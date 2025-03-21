import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './env.validate';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Throttler } from './throttler/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from './guards/auth.guard';
import { JwtRegister } from './jwt/jwt';
import { AuthMiddleware } from './middleware/auth.middleware';
import { GatewayProxyMiddleware } from './middleware/gateway-proxy.middleware';
import { MsReportsMiddleware } from './middleware/ms-reports.middleware';
import { AuthModule } from './api/auth/auth.module';
import { GatewayController } from './api/gateway/gateway.controller';
import { UsersModule } from './api/users/users.module';
import { UsersController } from './api/users/users.controller';
import { MsReportsController } from './api/ms-reports/ms-reports.controller';
import { ContactModule } from './api/contact/contact.module';
import { MsS3Controller } from './api/ms-s3/ms-s3.controller';
import { MsS3Middleware } from './middleware/ms-s3.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    Throttler,
    JwtRegister,
    TypeOrmModule.forRootAsync({ // Configuración de TypeORM
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres', // Indicamos que usamos PostgreSQL
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT'), 10), // Convertimos el puerto a número
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Carga automática de entidades
        synchronize: true, // Sincroniza las entidades (solo para desarrollo)
      }),
    }),
    AuthModule,
    UsersModule,
    ContactModule,
  ],
  controllers: [
    AppController,
    GatewayController,
    MsReportsController,
    UsersController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const controllers = [
      GatewayController,
      MsReportsController,
      MsS3Controller,
    ];

    controllers.forEach((controller) => {
      consumer.apply(AuthMiddleware).forRoutes(controller);
    });

    consumer.apply(GatewayProxyMiddleware).forRoutes(GatewayController);
    consumer.apply(MsReportsMiddleware).forRoutes(MsReportsController);
    consumer.apply(MsS3Middleware).forRoutes(MsS3Controller);
  }
}