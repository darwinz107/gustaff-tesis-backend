import { Module } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { OrdenDeTrabajoController } from './orden-de-trabajo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolicitudOrden } from './entities/solicitudOrden.entity';

import { UsersModule } from 'src/users/users.module';
import { EstadoTrabajo } from './entities/estadoTrabajo';



@Module({
  imports:[TypeOrmModule.forFeature([SolicitudOrden,EstadoTrabajo]),UsersModule],
  controllers: [OrdenDeTrabajoController],
  providers: [OrdenDeTrabajoService],
  exports:[TypeOrmModule]
})
export class OrdenDeTrabajoModule {}
