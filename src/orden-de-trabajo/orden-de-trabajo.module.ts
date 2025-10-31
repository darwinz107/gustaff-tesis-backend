import { Module } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { OrdenDeTrabajoController } from './orden-de-trabajo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Codigo } from './entities/codigo.entity';
import { Maquina } from './entities/maquina.entity';
import { SolicitudOrden } from './entities/solicitudOrden.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Area,Codigo,Maquina,SolicitudOrden])],
  controllers: [OrdenDeTrabajoController],
  providers: [OrdenDeTrabajoService],
})
export class OrdenDeTrabajoModule {}
