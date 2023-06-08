import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize/types';

import { resolve } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { CommentModule } from './modules/comment/comment.module';
import { ImageModule } from './modules/image/image.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { UserModule } from './modules/user/user.module';
import { S3Module } from './s3/s3.module';
import { MigrationsModule } from './database/migrations.module';

import { AppController } from './app.controller';

import { User } from './modules/user/user.model';
import { Portfolio } from './modules/portfolio/portfolio.model';
import { Image } from './modules/image/image.model';
import { Comment } from './modules/comment/comment.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), 'configs', `.${process.env.NODE_ENV}.env`),
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('DB_DIALECT') as Dialect,
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        logging: configService.get('SEQUELIZE_LOGGING') === 'true',
        models: [User, Portfolio, Comment, Image],
        autoLoadModels: true,
      }),
    }),
    MigrationsModule.register(),
    S3Module.registerAsync(),
    AuthModule,
    CommentModule,
    ImageModule,
    PortfolioModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
