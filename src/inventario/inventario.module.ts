import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Proovedores } from './entities/proovedores.entity';
import { RegistroSalida } from './entities/registroSalida.entity';
import { ItemsSalida } from './entities/itemsSalida.entity';
import { ItemsSolicitados } from './entities/itemsSolicitados.entity';
import { RegistroEntrada } from './entities/registroEntrada.entity';
import { ItemsEntrada } from './entities/itemsEntrada.entity';
import { SolicitudDeCompraModule } from 'src/solicitud-de-compra/solicitud-de-compra.module';

@Module({
  imports:[TypeOrmModule.forFeature([Inventario,Proovedores,ItemsSolicitados,RegistroSalida,ItemsSalida,RegistroEntrada,ItemsEntrada]),SolicitudDeCompraModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports:[TypeOrmModule.forFeature([ItemsSolicitados])]
})
export class InventarioModule {}
