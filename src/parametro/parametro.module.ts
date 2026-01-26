import { Module } from '@nestjs/common';
import { ParametroService } from './parametro.service';
import { ParametroController } from './parametro.controller';
import { Area } from './entities/area.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Codigo } from './entities/codigo.entity';
import { Maquina } from './entities/maquina.entity';
import { TipoTrabajo } from './entities/tipoTrabajo.entity';
import { Bodega } from './entities/bodega';
import { Seccion } from './entities/seccion';
import { Percha } from './entities/percha';
import { TipoMantenimiento } from './entities/tipoMantenimiento.entity';
import { Periodo } from './entities/periodo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Area,Codigo,Maquina,Categoria,TipoTrabajo,Bodega,Seccion,Percha,TipoMantenimiento,Periodo])],
  controllers: [ParametroController],
  providers: [ParametroService],
  exports:[TypeOrmModule],
})
export class ParametroModule {}
