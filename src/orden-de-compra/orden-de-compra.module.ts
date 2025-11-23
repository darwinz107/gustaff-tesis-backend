import { Module } from '@nestjs/common';
import { OrdenDeCompraService } from './orden-de-compra.service';
import { OrdenDeCompraController } from './orden-de-compra.controller';

@Module({
  controllers: [OrdenDeCompraController],
  providers: [OrdenDeCompraService],
})
export class OrdenDeCompraModule {}
