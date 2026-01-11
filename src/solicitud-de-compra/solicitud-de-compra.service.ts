import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudDeCompra } from './entities/solicitud-de-compra.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';

import { ItemsSolicitados } from 'src/inventario/entities/itemsSolicitados.entity';
import { EstadoCompra } from './entities/estadoCompra';
import { EstadoCompraEnum } from './enums/estadoCompra.enum';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CreateItemsSolicitadosDto } from 'src/inventario/dto/create-items-solicitados.dto';
import { EstadoUso } from 'src/orden-de-trabajo/entities/estadoUso';
import { MailService } from 'src/mail/mail.service';
import { FiltrarSolicitudCompraDto } from './dto/filtrar-solicitud-orden.dto';

@Injectable()
export class SolicitudDeCompraService implements OnModuleInit{

  constructor(@InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository:Repository<SolicitudDeCompra>,
  @InjectRepository(SolicitudOrden) private readonly ordenDeTrabajoRepository:Repository<SolicitudOrden>,
  @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
  @InjectRepository(EstadoCompra) private readonly estadoCompraRepository:Repository<EstadoCompra>,
  @InjectRepository(Inventario) private readonly inventarioRepository:Repository<Inventario>,
      private dataSource:DataSource,
      private readonly mailService:MailService,
){}

 async onModuleInit() {
     const lgt = [EstadoCompraEnum.PRO,EstadoCompraEnum.PAU,EstadoCompraEnum.PAR,EstadoCompraEnum.LIS,EstadoCompraEnum.ENT];
     
     for(const estado of lgt){
        const findEstado = await this.estadoCompraRepository.findOne({where:{estado:estado}});
        if(!findEstado){
          const newEstado = this.estadoCompraRepository.create({estado:estado});
          await this.estadoCompraRepository.save(newEstado);
        }
     }
  }

 async create(createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {
  console.log(createSolicitudDeCompraDto);
  const queryRunner = this.dataSource.createQueryRunner();
   await queryRunner.connect();
   await queryRunner.startTransaction();
 try {
  
 
    //const ordenTrabajo = await this.ordenDeTrabajoRepository.findOne({where:{id:createSolicitudDeCompraDto.ordenTrabajoId}});

    const ordenTrabajo = await queryRunner.manager.createQueryBuilder(SolicitudOrden,'solicitudOrden')
    .where('solicitudOrden.id = :id',{id:createSolicitudDeCompraDto.ordenTrabajoId})
    .getOne();

    if(!ordenTrabajo){
      throw new NotFoundException("No se encontro la orden de trabajo asociada");
    }

    //const estadoDefault = await this.estadoCompraRepository.findOne({where:{id:5}});
    
     const estadoDefault = await queryRunner.manager.createQueryBuilder(EstadoCompra,'estadoCompra')
    .where('estadoCompra.estado = :estado',{estado:EstadoCompraEnum.PRO})
    .getOne();
 if(!estadoDefault){
      throw new NotFoundException("No se encontro esta de compra");
    }

    const lgtSM = await queryRunner.manager.find(SolicitudDeCompra,{order:{id:"DESC"},take:1,select:['id']});
          if(!lgtSM){
            console.log("No se pudo crear el numSolicitudM");
         throw new NotFoundException("No se pudo crear el numOrden");
       }
       const lgtFinal = lgtSM.length > 0 ? lgtSM[0].id:0;

    const newNumOrden = 'SM-'+(lgtFinal+1).toString().padStart(5,'0');

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
         if(findItem.stock === 0){

          const obj2:CreateItemsSolicitadosDto = {item:item.item,cantidad:calcStock*(-1),caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:false,ordenCompra:solCompra};
           compras = [...compras,obj2]
         }else{
          const obj1:CreateItemsSolicitadosDto = {item:item.item,cantidad:findItem.stock,caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:true,ordenCompra:solCompra} 
        const obj2:CreateItemsSolicitadosDto = {item:item.item,cantidad:calcStock*(-1),caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:false,ordenCompra:solCompra} 
        compras = [...compras,obj1,obj2]
         }
        
      }

       if(calcStock >= 0){
        const obj1:CreateItemsSolicitadosDto = {item:item.item,cantidad:item.cantidad,caracteristica:item.caracteristica,Observacion:item.Observacion,existencia:true,ordenCompra:solCompra} 
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
await this.mailService.sendnewSolMaterialNotification(ordenTrabajo.NumOrden,solCompra.numOrden,compras);
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
      
      
      'ordenTrabajo.id',
      'ordenTrabajo.NumOrden',
      'ordenTrabajo.DescripcionTrabajo',
      //'userSolicitante.id',
      'userSolicitante.name',
      'estadoCompra.id',
      'estadoCompra.estado'
    ])
    
    .getMany();
    console.log(solicitudesCompra[0]);
 
      return solicitudesCompra;
     
  }

 

   async ordenCompraById(id:number) {
    console.log(id);
   /* if(!id){
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
    }*/

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
    if(solicitudesCompra === undefined){
      throw new NotFoundException("No se encontro solicitudes de compra");
    }
/*
    if(solicitudesCompra.estadoCompra.estado === EstadoCompraEnum.ENT){
 
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

    }*/

    return solicitudesCompra;
  
  }

  async solMaterialShort(){
    const res = await this.solicitudDeCompraRepository.find({select:['id','numOrden']});
    return res;
  }

   async ordenCompraByOrdenTrabajoId(id:number) {
    console.log(id);
   /* if(!id){
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
    }*/

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
    .where('ordenTrabajo.id = :id',{id})
    .getOne();
    if(!solicitudesCompra){
      throw new NotFoundException("No se encontro solicitudes de compra");
    }

 /*   if(solicitudesCompra.estadoCompra.estado === EstadoCompraEnum.ENT){
 
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
    .where('ordenTrabajo.id = :id',{id})
    .getOne();
    if(!solicitudesCompra){
      throw new NotFoundException("No se encontro solicitudes de compra");
  }}
*/
    

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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizar datos de la solicitud de compra
      let updateData: any = {};
      
      if (updateSolicitudDeCompraDto.Autoriza) {
        updateData.Autoriza = updateSolicitudDeCompraDto.Autoriza;
      }

      if (updateSolicitudDeCompraDto.estadoCompra) {
        const estCompra = await queryRunner.manager.findOne(EstadoCompra, {
          where: { estado: updateSolicitudDeCompraDto.estadoCompra }
        });
        if (!estCompra) {
          throw new NotFoundException("No se encontró un estado de compra válido");
        }
        updateData.estadoCompra = estCompra;
      }

      if (updateSolicitudDeCompraDto.ordenTrabajoId) {
        const ordenTrabajo = await queryRunner.manager.findOne(SolicitudOrden, {
          where: { NumOrden: updateSolicitudDeCompraDto.ordenTrabajoId }
        });
        if (!ordenTrabajo) {
          throw new NotFoundException("No se encontró una orden de trabajo válida");
        }
        updateData.numOrdenTrabajo = ordenTrabajo;
      }

      if (Object.keys(updateData).length > 0) {
        await queryRunner.manager.update(SolicitudDeCompra, { id }, updateData);
      }

      // Procesar actualizaciones de items solicitados
      if (updateSolicitudDeCompraDto.itemsSolicitados && updateSolicitudDeCompraDto.itemsSolicitados.length > 0 && updateSolicitudDeCompraDto.itemsSolicitados !== undefined) {
        
        // Obtener la solicitud de compra
        const solicitudCompra = await queryRunner.manager.findOne(SolicitudDeCompra, {
          where: { id }
        });

        if (!solicitudCompra) {
          throw new NotFoundException("No se encontró la solicitud de compra");
        }
   
        // Procesar cada item solicitado que llega
        for (const itemUpdate of updateSolicitudDeCompraDto.itemsSolicitados) {
          // Validar que el item existe
          const itemActual = await queryRunner.manager.findOne(ItemsSolicitados, {
            where: { id: itemUpdate.id }
          });

          if (!itemActual) {
            throw new NotFoundException(`No se encontró el item solicitado con ID ${itemUpdate.id}`);
          }

          // Obtener stock del inventario
          const inventarioItem = await queryRunner.manager.findOne(Inventario, {
            where: { nombre: itemActual.item },
            select: ['stock']
          });

          if (!inventarioItem) {
            throw new NotFoundException(`No se encontró el item en inventario con nombre ${itemActual.item}`);
          }

          const stockInventario = inventarioItem.stock;

          // Procesar según el valor de existencia
          if (itemActual.existencia === true) {
            // FLUJO 1: Item con existencia TRUE (llega con stock)
            await this.handleExistenciaTrue(
              queryRunner,
              itemActual,
              itemUpdate,
              stockInventario,
              solicitudCompra
            );
          } else {
            // FLUJO 2: Item con existencia FALSE (llega sin stock)
            await this.handleExistenciaFalse(
              queryRunner,
              itemActual,
              itemUpdate,
              stockInventario,
              solicitudCompra
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      return { msj: "Solicitud de compra actualizada correctamente", validate: true };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al actualizar solicitud de compra:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

 async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar la solicitud de compra
      const solicitud = await queryRunner.manager.findOne(SolicitudDeCompra, {
        where: { id }
      });

      if (!solicitud) {
        throw new NotFoundException(`No se encontró la solicitud de compra con ID ${id}`);
      }

      // Eliminar todos los items solicitados de esta solicitud
      const itemsEliminados = await queryRunner.manager.delete(ItemsSolicitados, {
        ordenCompra: { id }
      });

      // Eliminar la solicitud de compra
      const solicitudEliminada = await queryRunner.manager.delete(SolicitudDeCompra, { id });

      if (solicitudEliminada.affected === 0) {
        throw new Error("No se pudo eliminar la solicitud de compra");
      }

      await queryRunner.commitTransaction();
      
      return {
        msj: "Solicitud de material eliminada correctamente",
        validate: true,
        itemsEliminados: itemsEliminados.affected || 0
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al eliminar solicitud de compra:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllSolicitudes(){

    const solicitudes = await this.solicitudDeCompraRepository.find({where:[{estadoCompra:{estado:EstadoCompraEnum.PRO}},{estadoCompra:{estado:EstadoCompraEnum.LIS}}],relations:['itemSolicitados']});
    if(solicitudes.length ===0){
    return []
    }

    const solCompletas = solicitudes.filter(sol =>
      sol.itemSolicitados.every(item => item.existencia ===true)
    );
    return solCompletas;
  }

   async getAllSolicitudesParciales(){

    const solicitudes = await this.solicitudDeCompraRepository.find({where:[{estadoCompra:{estado:EstadoCompraEnum.PAR}},{estadoCompra:{estado:EstadoCompraEnum.PRO}}],relations:['itemSolicitados']});
    console.log(solicitudes.length);
    if(solicitudes.length ===0){
    return []
    }
     console.log("Si paso por aqui");
     const solCompletas = solicitudes.filter(sol =>
      sol.itemSolicitados.some(item => item.existencia ===false)
    );
    return solCompletas;
  }

async filtrarSolicitudesCompra(filtros: FiltrarSolicitudCompraDto) {
  const qb = this.solicitudDeCompraRepository.createQueryBuilder('solicitudCompra')
    .leftJoin('solicitudCompra.numOrdenTrabajo','ordenTrabajo')
    .leftJoin('ordenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('solicitudCompra.estadoCompra','estadoCompra')
    .select([
      'solicitudCompra.id',
      'solicitudCompra.numOrden',
      'solicitudCompra.fechaRemision',
      'solicitudCompra.Autoriza',
      'solicitudCompra.Destino',
      'ordenTrabajo.id',
      'ordenTrabajo.NumOrden',
      'ordenTrabajo.DescripcionTrabajo',
      'userSolicitante.name',
      'estadoCompra.id',
      'estadoCompra.estado'
    ]);

  if (filtros.numOrden) {
    qb.andWhere('solicitudCompra.numOrden LIKE :numOrden', { numOrden: `%${filtros.numOrden}%` });
  }
  if (filtros.fechaRemision) {
    qb.andWhere('DATE(solicitudCompra.fechaRemision) = :fechaRemision', { fechaRemision: filtros.fechaRemision });
  }
  if (filtros.solicitante) {
    qb.andWhere('userSolicitante.name LIKE :solicitante', { solicitante: `${filtros.solicitante}%` });
  }
  if (filtros.numOrdenTrabajo) {
    qb.andWhere('ordenTrabajo.NumOrden LIKE :numOrdenTrabajo', { numOrdenTrabajo: `%${filtros.numOrdenTrabajo}%` });
  }
  if (filtros.estadoCompra) {
    qb.andWhere('estadoCompra.estado = :estadoCompra', { estadoCompra: filtros.estadoCompra });
  }
  if (filtros.Destino) {
    qb.andWhere('solicitudCompra.Destino LIKE :Destino', { Destino: `%${filtros.Destino}%` });
  }
  if (filtros.Autoriza) {
    qb.andWhere('solicitudCompra.Autoriza LIKE :Autoriza', { Autoriza: `%${filtros.Autoriza}%` });
  }

  const resultados = await qb.getMany();
  return resultados;
}

  /**
   * Maneja la actualización de un item con existencia TRUE (tiene stock en inventario)
   * Lógica:
   * 1. Calcula cuánto cabe en stock
   * 2. Actualiza cantidad en el registro TRUE
   * 3. Si sobra cantidad, busca o crea registro FALSE con lo que falta
   * 4. Si no sobra, elimina registro FALSE si existe
   * 5. Sincroniza características y observación en ambos registros
   */
  private async handleExistenciaTrue(
    queryRunner: any,
    itemActual: ItemsSolicitados,
    itemUpdate: any,
    stockInventario: number,
    solicitudCompra: SolicitudDeCompra
  ) {
    const cantidadNueva = itemUpdate.cantidad !== undefined ? itemUpdate.cantidad : itemActual.cantidad;
    
    // Calcular cuánto cabe en stock
    const cantidadEnStock = Math.min(cantidadNueva, stockInventario);
    const diferencia = cantidadNueva - cantidadEnStock;

    // Actualizar el registro TRUE con la cantidad que cabe en stock
   
    
    // Sincronizar características y observación
    if (itemUpdate.caracteristica !== undefined) {
      itemActual.caracteristica = itemUpdate.caracteristica;
    }
    if (itemUpdate.Observacion !== undefined) {
      itemActual.Observacion = itemUpdate.Observacion;
    }

    if(cantidadEnStock === 0){
      await queryRunner.manager.delete(ItemsSolicitados, { id: itemActual.id });
    }else{
       itemActual.cantidad = cantidadEnStock;
    await queryRunner.manager.save(ItemsSolicitados, itemActual);
    }
    

    // Buscar registro complementario (FALSE)
    const itemComplementario = await queryRunner.manager.findOne(ItemsSolicitados, {
      where: {
        item: itemActual.item,
        ordenCompra: { id: solicitudCompra.id },
        existencia: false,
        id: Not(itemActual.id)
      }
    });

    if (diferencia > 0) {
      // Hay cantidad que sobra - necesita registro FALSE
      if (itemComplementario) {
        // Actualizar registro FALSE existente
        itemComplementario.cantidad = diferencia;
        itemComplementario.caracteristica = itemActual.caracteristica;
        itemComplementario.Observacion = itemActual.Observacion;
        await queryRunner.manager.save(ItemsSolicitados, itemComplementario);
      } else {
        // Crear nuevo registro FALSE
        const nuevoItemFaltante = queryRunner.manager.create(ItemsSolicitados, {
          item: itemActual.item,
          cantidad: diferencia,
          caracteristica: itemActual.caracteristica,
          Observacion: itemActual.Observacion,
          existencia: false,
          ordenCompra: solicitudCompra
        });
        await queryRunner.manager.save(ItemsSolicitados, nuevoItemFaltante);
      }
    } else {
      // No hay cantidad que sobra - eliminar registro FALSE si existe
      if (itemComplementario) {
        await queryRunner.manager.delete(ItemsSolicitados, { id: itemComplementario.id });
      }
    }
  }

  /**
   * Maneja la actualización de un item con existencia FALSE (sin stock en inventario)
   * Lógica bifurcada:
   * A) Si stock = 0: Solo actualiza cantidad, características y observación
   * B) Si stock > 0: Valida con inventario y distribuye entre TRUE y FALSE según stock
   */
  private async handleExistenciaFalse(
    queryRunner: any,
    itemActual: ItemsSolicitados,
    itemUpdate: any,
    stockInventario: number,
    solicitudCompra: SolicitudDeCompra
  ) {
    const cantidadNueva = itemUpdate.cantidad !== undefined ? itemUpdate.cantidad : itemActual.cantidad;

    if (stockInventario === 0) {
      // CASO A: Stock = 0 - Solo actualizar el registro FALSE
      
      // Sincronizar características y observación
      if (itemUpdate.caracteristica !== undefined) {
        itemActual.caracteristica = itemUpdate.caracteristica;
      }
      if (itemUpdate.Observacion !== undefined) {
        itemActual.Observacion = itemUpdate.Observacion;
      }

      // Si la cantidad es 0, eliminar el item
      if (cantidadNueva === 0) {
        await queryRunner.manager.delete(ItemsSolicitados, { id: itemActual.id });
      } else {
        itemActual.cantidad = cantidadNueva;
        await queryRunner.manager.save(ItemsSolicitados, itemActual);
      }
    } else {
      // CASO B: Stock > 0 - Distribuir entre TRUE y FALSE
      
      // Calcular cuánto cabe en stock
      const cantidadEnStock = Math.min(cantidadNueva, stockInventario);
      const diferencia = cantidadNueva - cantidadEnStock;

      // Buscar registro complementario (TRUE)
      const itemComplementario = await queryRunner.manager.findOne(ItemsSolicitados, {
        where: {
          item: itemActual.item,
          ordenCompra: { id: solicitudCompra.id },
          existencia: true,
          id: Not(itemActual.id)
        }
      });

      if (diferencia > 0) {
        // Hay cantidad que no cabe en stock - mantener/actualizar registro FALSE
        itemActual.cantidad = diferencia;
        
        // Sincronizar características y observación
        if (itemUpdate.caracteristica !== undefined) {
          itemActual.caracteristica = itemUpdate.caracteristica;
        }
        if (itemUpdate.Observacion !== undefined) {
          itemActual.Observacion = itemUpdate.Observacion;
        }
        
        await queryRunner.manager.save(ItemsSolicitados, itemActual);

        // Crear o actualizar registro TRUE
        if (itemComplementario) {
          itemComplementario.cantidad = cantidadEnStock;
          itemComplementario.caracteristica = itemActual.caracteristica;
          itemComplementario.Observacion = itemActual.Observacion;
          await queryRunner.manager.save(ItemsSolicitados, itemComplementario);
        } else {
          const nuevoItemEnStock = queryRunner.manager.create(ItemsSolicitados, {
            item: itemActual.item,
            cantidad: cantidadEnStock,
            caracteristica: itemActual.caracteristica,
            Observacion: itemActual.Observacion,
            existencia: true,
            ordenCompra: solicitudCompra
          });
          await queryRunner.manager.save(ItemsSolicitados, nuevoItemEnStock);
        }
      } else {
        // No hay cantidad que sobra - todo cabe en stock
        // Eliminar registro FALSE y crear/actualizar registro TRUE
        await queryRunner.manager.delete(ItemsSolicitados, { id: itemActual.id });

        if (itemComplementario) {
          itemComplementario.cantidad = cantidadNueva;
          itemComplementario.caracteristica = itemUpdate.caracteristica !== undefined ? itemUpdate.caracteristica : itemActual.caracteristica;
          itemComplementario.Observacion = itemUpdate.Observacion !== undefined ? itemUpdate.Observacion : itemActual.Observacion;
          await queryRunner.manager.save(ItemsSolicitados, itemComplementario);
        } else {
          const nuevoItemEnStock = queryRunner.manager.create(ItemsSolicitados, {
            item: itemActual.item,
            cantidad: cantidadNueva,
            caracteristica: itemUpdate.caracteristica !== undefined ? itemUpdate.caracteristica : itemActual.caracteristica,
            Observacion: itemUpdate.Observacion !== undefined ? itemUpdate.Observacion : itemActual.Observacion,
            existencia: true,
            ordenCompra: solicitudCompra
          });
          await queryRunner.manager.save(ItemsSolicitados, nuevoItemEnStock);
        }
      }
    }
  }
}
