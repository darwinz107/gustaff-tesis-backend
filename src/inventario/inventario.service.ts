import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Inventario } from './entities/inventario.entity';
import { CreateItemsSolicitadosDto } from './dto/create-items-solicitados.dto';
import { ItemsSolicitados } from './entities/itemsSolicitados.entity';
import { SolicitudDeCompra } from 'src/solicitud-de-compra/entities/solicitud-de-compra.entity';
import { StockDto } from './dto/stock.dto';
import { RegistroSalida } from './entities/registroSalida.entity';
import { CreateRegistroSalidaDto } from './dto/create-registro-salida.dto';
import { CreateItemsSalidaDto } from './dto/create-items-salida.dto';
import { ItemsSalida } from './entities/itemsSalida.entity';
import { EstadoCompra } from 'src/solicitud-de-compra/entities/estadoCompra';
import { CreateActaSalidaDto } from './dto/create-acta-salida.dto';
import { EstadoCompraEnum } from 'src/solicitud-de-compra/enums/estadoCompra.enum';

@Injectable()
export class InventarioService {

  constructor(@InjectRepository(Inventario) private readonly inventarioRepository:Repository<Inventario>,
              @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
              @InjectRepository(SolicitudDeCompra) private readonly solicitudDeComprasRepository:Repository<SolicitudDeCompra>,
               @InjectRepository(RegistroSalida) private readonly registroSalidaRepository:Repository<RegistroSalida>,
            private dataSource:DataSource,
            ){}

  create(createInventarioDto: CreateInventarioDto) {
    return 'This action adds a new inventario';
  }

  async evaluarStock(stockDto:StockDto){

const findItem = await this.inventarioRepository.findOne({where:{nombre:stockDto.item}});

   if(findItem){

      const calcStock = (findItem.stock -stockDto.cantidad);

      if(calcStock < 0){

        if(findItem.stock === 0){
 const compras = [
        
        {cantidad:calcStock*(-1),estado:"Por Comprar",validate:false}
       ]

       return compras;
        }else{
           const compras = [
        {cantidad:findItem.stock,estado:"En Stock",validate:true},
        {cantidad:calcStock*(-1),estado:"Por Comprar",validate:false}
       ]

       return compras;
        }
      }

       if(calcStock >= 0){
       const compras = [
        {cantidad:stockDto.cantidad,estado:"En Stock",validate:true}
       ]

       return compras;
      }

}
}

async createActaSalida(id:number/*,createActaSalidaDto:CreateActaSalidaDto*/){

   const queryRunner = this.dataSource.createQueryRunner();
   await queryRunner.connect();
   await queryRunner.startTransaction();

   try {
    
   const solMaterial = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
   .where('solicitudDeCompra.id = :id',{id:id})
   .getOne();

   if(!solMaterial){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }

   const itemsSolicitados = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'itemsSolicitados')
   .innerJoin('itemsSolicitados.ordenCompra','ordenCompra')
   .where('ordenCompra.id = :id',{id:solMaterial.id})
   .andWhere('itemsSolicitados.existencia = :ext',{ext:true})
   .getMany();

   if(!itemsSolicitados || itemsSolicitados.length === 0){
   throw new NotFoundException("No se encontro ningun item para salida");
   }

   const registroSalidaCreated = await queryRunner.manager.createQueryBuilder(RegistroSalida,'registroSalida')
   .innerJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
   .where('numSolicitudCompra.id = :id',{id:solMaterial.id})
   .getOne();

   
   if(!registroSalidaCreated){

    const registroSalida = await queryRunner.manager.count(RegistroSalida);

   const newNumSalida = 'AS-'+( registroSalida+1).toString().padStart(5,'0');
   let totalItems = 0;
   for(const item of itemsSolicitados){
     totalItems = totalItems + item.cantidad;
   }

   const newRegistroSalida:CreateRegistroSalidaDto = {
    numActa:newNumSalida,
    total:totalItems,
    numSolicitudCompra:solMaterial
   }

   await queryRunner.manager.save(RegistroSalida,newRegistroSalida);

   const registroSalidaNew = await queryRunner.manager.createQueryBuilder(RegistroSalida,'registroSalida')
   .innerJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
   .where('numSolicitudCompra.id = :id',{id:solMaterial.id})
   .getOne();

   if(!registroSalidaNew){
throw new NotFoundException("Fallo al encontrar el registro de salida");
   }

   for(const item of itemsSolicitados){
     
    const newItemsSalida:CreateItemsSalidaDto = {
       item:item.item,
       cantidad:item.cantidad,
       destino:solMaterial.Destino,
       regSalida:registroSalidaNew
    }

    await queryRunner.manager.save(ItemsSalida,newItemsSalida);

    const newInventario = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.item}});

    if(!newInventario){
    throw new NotFoundException("No se encontrol el item en inventario");
    }
    
    const newStock = newInventario.stock - item.cantidad;

    if(newStock <0 ){
    throw new NotFoundException("Inconsistencia al restar del inventario");
    }

    newInventario.stock = newStock;

    await queryRunner.manager.save(newInventario);

    await queryRunner.manager.delete(ItemsSolicitados,item.id);

   }
   const validarCambiarEstado = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'itemsSolicitados')
   .innerJoin('itemsSolicitados.ordenCompra','ordenCompra')
   .where('ordenCompra.id = :id',{id:solMaterial.id})
   .andWhere('itemsSolicitados.existencia = :ext',{ext:false})
   .getMany();

   if(validarCambiarEstado.length >0){
     const estadoParcial = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.PAR}});
     if(!estadoParcial){
throw new NotFoundException("No se encontro el estado");
     }
     solMaterial.estadoCompra = estadoParcial;
     await queryRunner.manager.save(solMaterial);
   }else{
    const estadoEntregado = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.ENT}});
     if(!estadoEntregado){
throw new NotFoundException("No se encontro el estado");
     }
     solMaterial.estadoCompra = estadoEntregado;
     await queryRunner.manager.save(solMaterial);
   }

   }else{
    for(const item of itemsSolicitados){
     
    const newItemsSalida:CreateItemsSalidaDto = {
       item:item.item,
       cantidad:item.cantidad,
       destino:solMaterial.Destino,
       regSalida:registroSalidaCreated
    }

    await queryRunner.manager.save(ItemsSalida,newItemsSalida);

     const newInventario = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.item}});

    if(!newInventario){
    throw new NotFoundException("No se encontrol el item en inventario");
    }
    
    const newStock = newInventario.stock - item.cantidad;

    if(newStock <0 ){
    throw new NotFoundException("Falta de stock para este item");
    }

    newInventario.stock = newStock;

    await queryRunner.manager.save(newInventario);

    await queryRunner.manager.delete(ItemsSolicitados,item.id);
   }
const estadoEntregado = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.ENT}});
     if(!estadoEntregado){
throw new NotFoundException("No se encontro el estado");
     }
     solMaterial.estadoCompra = estadoEntregado;
     await queryRunner.manager.save(solMaterial);
   }

    await queryRunner.commitTransaction();
return {msj:"Acta de salida creada",validate:true}
   } catch (error) {
    await  queryRunner.rollbackTransaction();
     console.log(error);
     return {msj:"Error al registrar la acta de salida",validate:false};
   }finally{
await  queryRunner.release();
   }
}

/*  async createItemsSolicitados(createItemsSolicitadosDto: CreateItemsSolicitadosDto) {
console.log("llego al servicio de inventario para items solicitados");
console.log(createItemsSolicitadosDto);
try {
    const ordenCompra = await this.solicitudDeComprasRepository.findOne({where:{numOrdenTrabajo:{id:createItemsSolicitadosDto.ordenTrabajoId}}});

    if(!ordenCompra){
      return {msj:"No se encontro una orden de compra asociada a la orden de trabajo"};
    }

    /*const findItem = await this.inventarioRepository.findOne({where:{nombre:createItemsSolicitadosDto.item}});

    if(!findItem){

      const newItemSolicitado = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:createItemsSolicitadosDto.cantidad, 
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:false
      });
      await this.itemsSolicitadosRepository.save(newItemSolicitado);
      return {msj:"El item no se encuentra en el inventario"};
    }

     if(findItem){
      if(findItem.stock>=createItemsSolicitadosDto.cantidad){
        const newItemSolicitado = this.itemsSolicitadosRepository.create({
          item:createItemsSolicitadosDto.item,
          cantidad:createItemsSolicitadosDto.cantidad,
          caracteristica:createItemsSolicitadosDto.caracteristica,
          Observacion:createItemsSolicitadosDto.Observacion,
          ordenCompra:ordenCompra,
          existencia:true
        });
        await this.itemsSolicitadosRepository.save(newItemSolicitado);
        return {msj:"Item registrado con existencia en inventario"};
      }

      if(findItem.stock<createItemsSolicitadosDto.cantidad){

      const newItemConStock = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:findItem.stock,
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:true
      });
      await this.itemsSolicitadosRepository.save(newItemConStock);

      const stockNosuficiente = createItemsSolicitadosDto.cantidad - findItem.stock;
      const newItemNoStock = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:stockNosuficiente,
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:false
      });
*/
   /*   await this.itemsSolicitadosRepository.save({item:createItemsSolicitadosDto.item,cantidad:createItemsSolicitadosDto.cantidad,caracteristica:createItemsSolicitadosDto.caracteristica,Observacion:createItemsSolicitadosDto.Observacion,existencia:createItemsSolicitadosDto.existencia,ordenCompra:ordenCompra});
      return {msj:"Item registrado con existencia en inventario"};*/
   // }
    
 // }
/*} catch (error) {
    console.log(error);
    return {msj:"Error al registrar el item solicitado"};
}
  
}*/

  async findAll() {

    const inventarios = await this.inventarioRepository.find({select:['id','nombre','stock']});
    if(inventarios === null|| inventarios === undefined){
      return new NotFoundException("No se encontro inventarios");
    }
    return inventarios;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventario`;
  }

 async filtrarInventario(item: string) {

    const inventario = await this.inventarioRepository.find({where:{nombre:Like(`${item}%`)},select:['id','nombre','stock']});

    return inventario;
  }

  async actaDeSalidaByIdCompra(id:number) {
   
  console.log('ID de la acta de salida:', id);

    const registroDeSalida = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
    .leftJoin('registroSalida.itemSalida','itemSalida')
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroSalida.entrega','entrega')
    .select([

      'registroSalida.numActa',
      'registroSalida.fechaRemision',
      'userSolicitante.id',
      'userSolicitante.name',
      'entrega.name',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numSolicitudCompra.Destino',
      
      'itemSalida.item',
      'itemSalida.cantidad',  
      'itemSalida.Observacion',
      
    ])
    .where('numSolicitudCompra.id = :id',{id})
    .getOne();
    if(!registroDeSalida){
      throw new NotFoundException("No se encontro registro de salidas");
    }
    return registroDeSalida;
  }

  async findAllRegistroSalida() {

     const registroDeSalida = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroSalida.entrega','entrega')
    .select([

      'registroSalida.numActa',
      'registroSalida.fechaRemision',
      
      'userSolicitante.name',
      'entrega.name',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numSolicitudCompra.Destino'
      
    ])
    
    .getMany();
    if(!registroDeSalida){
      throw new NotFoundException("No se encontro registro de salidas");
    }
    return registroDeSalida;
  }

  update(id: number, updateInventarioDto: UpdateInventarioDto) {
    return `This action updates a #${id} inventario`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventario`;
  }
}
