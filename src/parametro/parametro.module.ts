import { Module } from '@nestjs/common';
import { ParametroService } from './parametro.service';
import { ParametroController } from './parametro.controller';
import { Area } from './entities/area.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Codigo } from './entities/codigo.entity';
import { Maquina } from './entities/maquina.entity';
import { TipoTrabajo } from './entities/tipoTrabajo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Area,Codigo,Maquina,Categoria,TipoTrabajo])],
  controllers: [ParametroController],
  providers: [ParametroService],
  exports:[TypeOrmModule],
})
export class ParametroModule {}
