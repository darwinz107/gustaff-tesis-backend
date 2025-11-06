import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { OrdenDeTrabajoModule } from './orden-de-trabajo/orden-de-trabajo.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),JwtModule.register({
    global:true,
    secret:process.env.SECRET || "messi",
    signOptions:{expiresIn:'1h'}
  }),TypeOrmModule.forRoot({
     type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.user,
      password: process.env.pass,
      database: process.env.db,
      entities: [],
      autoLoadEntities:true,
      synchronize: true,
  }),UsersModule, AuthModule,RolesModule, OrdenDeTrabajoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
