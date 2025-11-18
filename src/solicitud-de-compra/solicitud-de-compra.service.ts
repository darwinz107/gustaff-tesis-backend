import { Injectable } from '@nestjs/common';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';

@Injectable()
export class SolicitudDeCompraService {
  create(createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {
    return 'This action adds a new solicitudDeCompra';
  }

  findAll() {
    return `This action returns all solicitudDeCompra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudDeCompra`;
  }

  update(id: number, updateSolicitudDeCompraDto: UpdateSolicitudDeCompraDto) {
    return `This action updates a #${id} solicitudDeCompra`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudDeCompra`;
  }
}
