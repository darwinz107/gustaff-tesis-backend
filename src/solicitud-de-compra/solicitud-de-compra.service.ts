import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';
import { Repository } from 'typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';

import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';
import { EstadoCompra } from './entities/estadoCompra';
import { EstadoCompraEnum } from './enums/estadoCompra.enum';

@Injectable()
export class SolicitudDeCompraService implements OnModuleInit{

  constructor(@InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository:Repository<SolicitudDeCompra>,
  @InjectRepository(SolicitudOrden) private readonly ordenDeTrabajoRepository:Repository<SolicitudOrden>,
  @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
  @InjectRepository(EstadoCompra) private readonly estadoCompraRepository:Repository<EstadoCompra>,
){}

 async onModuleInit() {
     const lgt = [EstadoCompraEnum.PRO,EstadoCompraEnum.PAU,EstadoCompraEnum.LIS,EstadoCompraEnum.ENT];
     
     for(const estado of lgt){
        const findEstado = await this.estadoCompraRepository.findOne({where:{estado:estado}});
        if(!findEstado){
          const newEstado = this.estadoCompraRepository.create({estado:estado});
          await this.estadoCompraRepository.save(newEstado);
        }
     }
  }

 async create(createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {
  console.log("llego al servicio de solicitud de compra");
  console.log(createSolicitudDeCompraDto.Destino);

  try {
    const ordenTrabajo = await this.ordenDeTrabajoRepository.findOne({where:{id:createSolicitudDeCompraDto.ordenTrabajoId}});

    if(!ordenTrabajo){
      throw new NotFoundException("No se encontro la orden de trabajo asociada");
    }

    const estadoDefault = await this.estadoCompraRepository.findOne({where:{id:1}});
 if(!estadoDefault){
      throw new NotFoundException("No se encontro esta de compra");
    }


    const newNumOrden = 'OC-'+(await this.solicitudDeCompraRepository.count()+1).toString().padStart(5,'0');

    const nuevaSolicitudCompra = this.solicitudDeCompraRepository.create({
      numOrden:newNumOrden,
      numOrdenTrabajo:ordenTrabajo,
      Autoriza:createSolicitudDeCompraDto.Autoriza,
      Destino:createSolicitudDeCompraDto.Destino,
      estadoCompra:estadoDefault
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

 async findAllSolicitudesCompra() {

    const solicitudesCompra = await this.solicitudDeCompraRepository.find();
    if(!solicitudesCompra){
      throw new NotFoundException("No se encontro solicitudes de compra");
    }

    return solicitudesCompra;
  
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
