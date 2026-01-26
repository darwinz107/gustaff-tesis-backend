import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';
import { RegistroSalida } from 'src/inventario/entities/registroSalida.entity';

@Module({
  imports:[TypeOrmModule.forFeature([SolicitudOrden,RegistroSalida])],
  controllers: [ReporteController],
  providers: [ReporteService],
})
export class ReporteModule {}
