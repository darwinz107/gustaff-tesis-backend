import { Module } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { OrdenDeTrabajoController } from './orden-de-trabajo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolicitudOrden } from './entities/solicitudOrden.entity';

import { UsersModule } from 'src/users/users.module';



@Module({
  imports:[TypeOrmModule.forFeature([SolicitudOrden]),UsersModule],
  controllers: [OrdenDeTrabajoController],
  providers: [OrdenDeTrabajoService],
  exports:[TypeOrmModule]
})
export class OrdenDeTrabajoModule {}
