import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),TypeOrmModule.forRoot({
     type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.user,
      password: process.env.pass,
      database: process.env.db,
      entities: [],
      autoLoadEntities:true,
      synchronize: false,
  }),UsersModule, AuthModule,RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
