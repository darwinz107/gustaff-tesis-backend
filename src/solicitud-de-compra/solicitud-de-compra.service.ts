import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';
import { Repository } from 'typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';

import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';

@Injectable()
export class SolicitudDeCompraService {

  constructor(@InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository:Repository<SolicitudDeCompra>,
  @InjectRepository(SolicitudOrden) private readonly ordenDeTrabajoRepository:Repository<SolicitudOrden>,
  @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
){}

 async create(createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {
  console.log("llego al servicio de solicitud de compra");
  console.log(createSolicitudDeCompraDto.Destino);

  try {
    const ordenTrabajo = await this.ordenDeTrabajoRepository.findOne({where:{id:createSolicitudDeCompraDto.ordenTrabajoId}});

    if(!ordenTrabajo){
      throw new NotFoundException("No se encontro la orden de trabajo asociada");
    }

    const newNumOrden = 'OC-'+(await this.solicitudDeCompraRepository.count()+1).toString().padStart(5,'0');

    const nuevaSolicitudCompra = this.solicitudDeCompraRepository.create({
      numOrden:newNumOrden,
      numOrdenTrabajo:ordenTrabajo,
      Autoriza:createSolicitudDeCompraDto.Autoriza,
      Destino:createSolicitudDeCompraDto.Destino
    });

    await this.solicitudDeCompraRepository.save(nuevaSolicitudCompra);

    return {msj:"Solicitud de compra creada"}
  } catch (error) {
     console.log(error);
     return {msj:"Error al registrar la solicitud de compra"};
  }
    
  }

  /*async getUltimaSolicitudCompra() {
    const ultimaSolicitud = await this.solicitudDeCompraRepository.findOne({order:{id:'DESC'}, relations:['numOrdenTrabajo']});

    if(!ultimaSolicitud){
      throw new NotFoundException("No se encontro ninguna solicitud de compra");
    }
    const itemsSolicitados = await this.itemsSolicitadosRepository.find({where:{ordenCompra:{id:ultimaSolicitud.id}}});
    if(!itemsSolicitados){
      throw new NotFoundException("No se encontraron items solicitados para la ultima solicitud de compra");
    }

    return {solicitudCompra:ultimaSolicitud, itemsSolicitados:itemsSolicitados};
    
  }*/

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
