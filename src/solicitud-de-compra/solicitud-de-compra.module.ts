import { Module } from '@nestjs/common';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';
import { SolicitudDeCompraController } from './solicitud-de-compra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';

import { InventarioModule } from 'src/inventario/inventario.module';
import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { OrdenDeTrabajoModule } from 'src/orden-de-trabajo/orden-de-trabajo.module';
import { EstadoCompra } from './entities/estadoCompra';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports:[TypeOrmModule.forFeature([SolicitudDeCompra,ItemsSolicitados,EstadoCompra,Inventario]),OrdenDeTrabajoModule,MailModule],
  controllers: [SolicitudDeCompraController],
  providers: [SolicitudDeCompraService],
  exports:[TypeOrmModule,TypeOrmModule.forFeature([SolicitudDeCompra])]
})
export class SolicitudDeCompraModule {}
