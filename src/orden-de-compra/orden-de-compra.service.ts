import { Injectable } from '@nestjs/common';
import { CreateOrdenDeCompraDto } from './dto/create-orden-de-compra.dto';
import { UpdateOrdenDeCompraDto } from './dto/update-orden-de-compra.dto';

@Injectable()
export class OrdenDeCompraService {
  create(createOrdenDeCompraDto: CreateOrdenDeCompraDto) {
    return 'This action adds a new ordenDeCompra';
  }

  findAll() {
    return `This action returns all ordenDeCompra`;
  }


  findOne(id: number) {
    return `This action returns a #${id} ordenDeCompra`;
  }

  update(id: number, updateOrdenDeCompraDto: UpdateOrdenDeCompraDto) {
    return `This action updates a #${id} ordenDeCompra`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenDeCompra`;
  }
}
