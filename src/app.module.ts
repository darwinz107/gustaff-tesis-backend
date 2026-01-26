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
import { SolicitudDeCompraModule } from './solicitud-de-compra/solicitud-de-compra.module';
import { InventarioModule } from './inventario/inventario.module';
import { ParametroModule } from './parametro/parametro.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

import { DashboardModule } from './dashboard/dashboard.module';

import { ReporteModule } from './reporte/reporte.module';



@Module({
  imports: [   
     ConfigModule.forRoot({
    isGlobal:true
  }),
      MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST ||"smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
    }),
    ScheduleModule.forRoot(),
JwtModule.register({
    global:true,
    secret:process.env.SECRET || "messi",
    signOptions:{expiresIn:'10h'}
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
  }),UsersModule, AuthModule,RolesModule, OrdenDeTrabajoModule, SolicitudDeCompraModule, InventarioModule, ParametroModule, AdminModule, DashboardModule, ReporteModule],
    

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
