import { Module } from '@nestjs/common';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';
import { SolicitudDeCompraController } from './solicitud-de-compra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';

@Module({
  imports:[TypeOrmModule.forFeature([SolicitudDeCompra])],
  controllers: [SolicitudDeCompraController],
  providers: [SolicitudDeCompraService],
})
export class SolicitudDeCompraModule {}
