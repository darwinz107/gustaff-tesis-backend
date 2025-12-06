import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';
import { DataSource, Repository } from 'typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';

import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';
import { EstadoCompra } from './entities/estadoCompra';
import { EstadoCompraEnum } from './enums/estadoCompra.enum';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CreateItemsSolicitadosDto } from 'src/inventario/dto/create-items-solicitados.dto';
import { EstadoUso } from 'src/orden-de-trabajo/entities/estadoUso';

@Injectable()
export class SolicitudDeCompraService implements OnModuleInit{

  constructor(@InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository:Repository<SolicitudDeCompra>,
  @InjectRepository(SolicitudOrden) private readonly ordenDeTrabajoRepository:Repository<SolicitudOrden>,
  @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
  @InjectRepository(EstadoCompra) private readonly estadoCompraRepository:Repository<EstadoCompra>,
      private dataSource:DataSource,
){}

 async onModuleInit() {
     const lgt = [EstadoCompraEnum.PRO,EstadoCompraEnum.PAU,EstadoCompraEnum.PAR,EstadoCompraEnum.ENT];
     
     for(const estado of lgt){
        const findEstado = await this.estadoCompraRepository.findOne({where:{estado:estado}});
        if(!findEstado){
          const newEstado = this.estadoCompraRepository.create({estado:estado});
          await this.estadoCompraRepository.save(newEstado);
        }
     }
  }

 async create(createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {

  const queryRunner = this.dataSource.createQueryRunner();
   await queryRunner.connect();
   await queryRunner.startTransaction();
 try {
  console.log("llego al servicio de solicitud de compra");
  console.log(createSolicitudDeCompraDto.Destino);

 
    //const ordenTrabajo = await this.ordenDeTrabajoRepository.findOne({where:{id:createSolicitudDeCompraDto.ordenTrabajoId}});

    const ordenTrabajo = await queryRunner.manager.createQueryBuilder(SolicitudOrden,'solicitudOrden')
    .where('solicitudOrden.id = :id',{id:createSolicitudDeCompraDto.ordenTrabajoId})
    .getOne();

    if(!ordenTrabajo){
      throw new NotFoundException("No se encontro la orden de trabajo asociada");
    }

    //const estadoDefault = await this.estadoCompraRepository.findOne({where:{id:5}});
     const estadoDefault = await queryRunner.manager.createQueryBuilder(EstadoCompra,'estadoCompra')
    .where('estadoCompra.id = :id',{id:5})
    .getOne();
 if(!estadoDefault){
      throw new NotFoundException("No se encontro esta de compra");
    }


    const newNumOrden = 'SM-'+(await this.solicitudDeCompraRepository.count()+1).toString().padStart(5,'0');

   /* const nuevaSolicitudCompra = this.solicitudDeCompraRepository.create({
      numOrden:newNumOrden,
      numOrdenTrabajo:ordenTrabajo,
      Autoriza:createSolicitudDeCompraDto.Autoriza,
      Destino:createSolicitudDeCompraDto.Destino,
      estadoCompra:estadoDefault
    });

    await this.solicitudDeCompraRepository.save(nuevaSolicitudCompra);*/

    const nuevaCompra = {
      numOrden:newNumOrden,
      numOrdenTrabajo:ordenTrabajo,
      Autoriza:createSolicitudDeCompraDto.Autoriza,
      Destino:createSolicitudDeCompraDto.Destino,
      estadoCompra:estadoDefault
    }

    const nuevaSolicitudCompra = await queryRunner.manager.save(SolicitudDeCompra,nuevaCompra);

  /*  const findItem = await this.inventarioRepository.findOne({where:{nombre:stockDto.item}});

     if(findItem){

      const calcStock = (findItem.stock -stockDto.cantidad);

      if(calcStock < 0){
       const compras = [
        {cantidad:findItem.stock,estado:"En Stock",validate:true},
        {cantidad:calcStock*(-1),estado:"Por Comprar",validate:false}
       ]

       return compras;
      }

       if(calcStock >= 0){
       const compras = [
        {cantidad:stockDto.cantidad,estado:"En Stock",validate:true}
       ]

       return compras;
      }
*/

const solCompra = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
.innerJoin('solicitudDeCompra.numOrdenTrabajo','ordenTrabajo')
.where('ordenTrabajo.id = :ordenTrabajoId',{ordenTrabajoId:createSolicitudDeCompraDto.ordenTrabajoId})
.getOne();

 if(!solCompra){
      throw new NotFoundException("No se encontro la solicitud de material asociada a la orden de trabajo");
    }

let compras:CreateItemsSolicitadosDto[] = [];

for(const item of createSolicitudDeCompraDto.items){
       const findItem = await queryRunner.manager.createQueryBuilder(Inventario,'inventario')
       .where('inventario.nombre = :item',{item: item.item})
       .getOne();

       if(findItem){

      const calcStock = (findItem.stock -item.cantidad);

      if(calcStock < 0){
        const obj1:CreateItemsSolicitadosDto = {item:item.item,cantidad:findItem.stock,caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:true,ordenCompra:solCompra} 
        const obj2:CreateItemsSolicitadosDto = {item:item.item,cantidad:calcStock*(-1),caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:false,ordenCompra:solCompra} 
        compras = [...compras,obj1,obj2]
      
      }

       if(calcStock >= 0){
        const obj1:CreateItemsSolicitadosDto = {item:item.item,cantidad:findItem.stock,caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:true,ordenCompra:solCompra} 
        compras = [...compras,obj1]
      
      }

}else{
    const obj1:CreateItemsSolicitadosDto = {item:item.item,cantidad:item.cantidad,caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:false,ordenCompra:solCompra} 
        compras = [...compras,obj1]

}
}

for(const compra of compras){
   const saveItemsSolicitados = await queryRunner.manager.save(ItemsSolicitados,compra);
}

 ordenTrabajo.estadoUso = {id:2} as any;

const cambiarEstadoUsoTrabajo = await queryRunner.manager.save(SolicitudOrden,ordenTrabajo);

   
/* const actulizarTrabajo =   await this.ordenDeTrabajoRepository.save(ordenTrabajo);
 if(actulizarTrabajo){
  return {msj:"Solicitud de compra creada",validate:true}
   
 }*/
await queryRunner.commitTransaction();
return {msj:"Solicitud de compra creada",validate:true}
    
  } catch (error) {
  await  queryRunner.rollbackTransaction();
     console.log(error);
     return {msj:"Error al registrar la solicitud de compra",validate:false};
  }finally{
    await  queryRunner.release();
  
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

    const solicitudesCompra = await this.solicitudDeCompraRepository.createQueryBuilder('solicitudCompra')
    .leftJoin('solicitudCompra.numOrdenTrabajo','ordenTrabajo')
    .leftJoin('ordenTrabajo.userSolicitante','userSolicitante')
    
    .leftJoin('solicitudCompra.estadoCompra','estadoCompra')
    .select([
      'solicitudCompra.id',
      'solicitudCompra.numOrden',
      'solicitudCompra.fechaRemision',
      'solicitudCompra.Autoriza',
      'solicitudCompra.Destino',
      
      //'ordenTrabajo.id',
      'ordenTrabajo.NumOrden',
      'ordenTrabajo.DescripcionTrabajo',
      //'userSolicitante.id',
      'userSolicitante.name',
      'estadoCompra.id',
      'estadoCompra.estado'
    ])
    
    .getMany();
    console.log(solicitudesCompra[0]);
    if(!solicitudesCompra){
      throw new NotFoundException("No se encontro solicitudes de compra");
    }

    return solicitudesCompra;
  
  }

 

   async ordenCompraById(id:number) {
    console.log(id);
    if(!id){
     const sinId = await this.solicitudDeCompraRepository.createQueryBuilder('solicitudMaterial')
      .select([
        'solicitudMaterial.id'
      ])
      .orderBy('solicitudMaterial.id','ASC')
      .getOne();

      if(!sinId){
        throw new NotFoundException("No existen ninguna orden de compra");
      }
      console.log(sinId);
      id = sinId.id;
    }

    console.log('ID de la solicitud de compra:', id);

    const solicitudesCompra = await this.solicitudDeCompraRepository.createQueryBuilder('solicitudCompra')
    .leftJoin('solicitudCompra.numOrdenTrabajo','ordenTrabajo')
    .leftJoin('ordenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('solicitudCompra.estadoCompra','estadoCompra')
    .leftJoin('solicitudCompra.itemSolicitados','itemSolicitados')
    .select([
      'solicitudCompra.id',
      'solicitudCompra.numOrden',
      'solicitudCompra.fechaRemision',
      'solicitudCompra.Autoriza',
      'solicitudCompra.Destino',
      
      //'ordenTrabajo.id',
      'ordenTrabajo.id',
      'ordenTrabajo.NumOrden',
      'ordenTrabajo.DescripcionTrabajo',
      'ordenTrabajo.Area',
      'ordenTrabajo.Codigo',
      'ordenTrabajo.Maquina',
      //'userSolicitante.id',
      'userSolicitante.name',
      'estadoCompra.id',
      'estadoCompra.estado',
      'itemSolicitados.id',
      'itemSolicitados.item',
      'itemSolicitados.cantidad',
      'itemSolicitados.caracteristica',
      'itemSolicitados.Observacion',
      'itemSolicitados.existencia',
    ])
    .where('solicitudCompra.id = :id',{id})
    .getOne();
    if(!solicitudesCompra){
      throw new NotFoundException("No se encontro solicitudes de compra");
    }

    return solicitudesCompra;
  
  }

  

  async getAllEstadosCompra(){

    const estadosCompra = await this.estadoCompraRepository.find({select:['id','estado']});

    if(!estadosCompra){
  throw new NotFoundException("No se encontro estados de compra");
    }

    return estadosCompra;
  }

  async update(id: number, updateSolicitudDeCompraDto: UpdateSolicitudDeCompraDto) {

    const ordenTrabajo = await this.ordenDeTrabajoRepository.findOne({where:{NumOrden:updateSolicitudDeCompraDto.ordenTrabajoId}});

    if(!ordenTrabajo){
    return {msj:"No se encontro una orden de trabajo valida",validate:false}
    }

    const nOrdenTrabajoBefore = await this.solicitudDeCompraRepository.findOne({where:{id:id},relations:['numOrdenTrabajo']});

     if(!nOrdenTrabajoBefore){
    return {msj:"No se encontro una orden de trabajo anterior",validate:false}
    }

    const ordenTrabjoOld = await this.ordenDeTrabajoRepository.findOne({where:{id:nOrdenTrabajoBefore.numOrdenTrabajo.id}});

    if(!ordenTrabjoOld){
    return {msj:"No se encontro una orden de trabajo valida",validate:false}
    }

    const estCompra = await this.estadoCompraRepository.findOne({where:{estado:updateSolicitudDeCompraDto.estadoCompra}});
    if(!estCompra){
    throw new NotFoundException("No es encontro un estado de compra");
    }

    const updateSoliMaterial = await this.solicitudDeCompraRepository.update(id,{Autoriza:updateSolicitudDeCompraDto.Autoriza,Destino:updateSolicitudDeCompraDto.Destino,numOrdenTrabajo:ordenTrabajo,estadoCompra:estCompra});

    if(updateSoliMaterial.affected !== 0){

      const estadoAnterior = new EstadoUso();
      estadoAnterior.id = 1;

       const estadoNuevo = new EstadoUso();
      estadoNuevo.id = 2;

   ordenTrabjoOld.estadoUso = estadoAnterior;
    await this.ordenDeTrabajoRepository.save(ordenTrabjoOld);

    ordenTrabajo.estadoUso = estadoNuevo;
    await this.ordenDeTrabajoRepository.save(ordenTrabajo);

    return {msj:"Actualizado solicitud de material",validate:true}
    }

    return {msj:"No se pudo actualizar la solicitud de material"};
  }

 async remove(id: number) {

    const buscarItems = await this.itemsSolicitadosRepository.find({where:{ordenCompra:{id:id}}});

    if(buscarItems){
    for(const item of buscarItems){
        await this.itemsSolicitadosRepository.delete(item.id);
    }
  }else{
    return {msj:"No se encontraron items relacionados"}
  }


    const deleteSolMaterial = await this.solicitudDeCompraRepository.delete(id);

    if(deleteSolMaterial){
     return {msj:"Solicitud de material eliminada!"}
    }
    return {msj:"Fallo al eliminar la solicitud de material"}
    
  }

  async getAllSolicitudes(){

    const solicitudes = await this.solicitudDeCompraRepository.find({where:[{estadoCompra:{id:1}},{estadoCompra:{id:5}}]});
    if(!solicitudes){
    throw new NotFoundException("No se encontro solicitudes de material");
    }
    return solicitudes;
  }


}
