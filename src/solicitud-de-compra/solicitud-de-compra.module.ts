import { Module } from '@nestjs/common';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';
import { SolicitudDeCompraController } from './solicitud-de-compra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';

import { InventarioModule } from 'src/inventario/inventario.module';
import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';
import { OrdenDeTrabajoModule } from 'src/orden-de-trabajo/orden-de-trabajo.module';
import { EstadoCompra } from './entities/estadoCompra';

@Module({
  imports:[TypeOrmModule.forFeature([SolicitudDeCompra,ItemsSolicitados,EstadoCompra]),OrdenDeTrabajoModule],
  controllers: [SolicitudDeCompraController],
  providers: [SolicitudDeCompraService],
  exports:[TypeOrmModule,TypeOrmModule.forFeature([SolicitudDeCompra])]
})
export class SolicitudDeCompraModule {}
