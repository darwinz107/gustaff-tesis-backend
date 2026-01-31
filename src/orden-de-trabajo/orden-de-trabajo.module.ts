import { Module } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { OrdenDeTrabajoController } from './orden-de-trabajo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolicitudOrden } from './entities/solicitudOrden.entity';

import { UsersModule } from 'src/users/users.module';
import { EstadoTrabajo } from './entities/estadoTrabajo';
import { SolicitudDeCompra } from 'src/solicitud-de-compra/entities/solicitud-de-compra.entity';
import { EstadoUso } from './entities/estadoUso';
import { Jornada } from './entities/jornadas';
import { Fases } from './entities/fases';
import { MailModule } from 'src/mail/mail.module';
import { TipoMantenimiento } from 'src/parametro/entities/tipoMantenimiento.entity';
import { Periodo } from 'src/parametro/entities/periodo.entity';
import { EstadoCompra } from 'src/solicitud-de-compra/entities/estadoCompra';



@Module({
  imports:[TypeOrmModule.forFeature([SolicitudOrden,EstadoTrabajo,SolicitudDeCompra,EstadoUso,Jornada,Fases,TipoMantenimiento,Periodo,EstadoCompra]),UsersModule,MailModule],
  controllers: [OrdenDeTrabajoController],
  providers: [OrdenDeTrabajoService],
  exports:[TypeOrmModule]
})
export class OrdenDeTrabajoModule {}
