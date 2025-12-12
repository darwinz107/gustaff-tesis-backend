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
import { CreateActaEntradaDto } from './dto/create-acta-entrada.dto';
import { RegistroEntrada } from './entities/registroEntrada.entity';
import { Proovedores } from './entities/proovedores.entity';
import { ItemsEntrada } from './entities/itemsEntrada.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class InventarioService {

  constructor(@InjectRepository(Inventario) private readonly inventarioRepository:Repository<Inventario>,
              @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
              @InjectRepository(SolicitudDeCompra) private readonly solicitudDeComprasRepository:Repository<SolicitudDeCompra>,
               @InjectRepository(RegistroSalida) private readonly registroSalidaRepository:Repository<RegistroSalida>,
               @InjectRepository(RegistroEntrada) private readonly registroEntradaRepository:Repository<RegistroEntrada>,
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

async asignarInfoActaEntrada (id:number){

  const registroEntrada = await this.itemsSolicitadosRepository.createQueryBuilder("itemsSolicitados")
  .leftJoin("itemsSolicitados.ordenCompra","ordenCompra")
  .leftJoin("ordenCompra.estadoCompra","estadoCompra")
  
  .select(
    [  "itemsSolicitados.id",
      "itemsSolicitados.item",
      "itemsSolicitados.cantidad",
      "itemsSolicitados.caracteristica",
      "itemsSolicitados.Observacion",
    ])
  .where("ordenCompra.id =:id",{id:id})
  .andWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PAR})
  .getMany();

if(!registroEntrada){
   throw new NotFoundException("No se encontro una solicitud de material asociada con items solicitados");
   }

let compras:{}[] =[];

  for(const item of registroEntrada){
     
    const findItem = await this.inventarioRepository.findOne({where:{nombre:item.item}});

    if(findItem == null || findItem == undefined){
   throw new NotFoundException("No se encontro una solicitud de material asociada con items solicitados");
   }

    if(findItem){
     compras = [...compras,{id:findItem.id,nombre:findItem.nombre,cantidad:item.cantidad,costo:findItem.costo,Observacion:item.Observacion}]
    }else{
      compras = [...compras,{id:null,nombre:item.item,cantidad:item.cantidad,costo:null,Observacion:item.Observacion}]
    }
  }

  const registroEntradaInfo = await this.solicitudDeComprasRepository.createQueryBuilder("solicitudDeCompra")
  
  .leftJoin("solicitudDeCompra.estadoCompra","estadoCompra")
  .leftJoin("solicitudDeCompra.numOrdenTrabajo","numOrdenTrabajo")
  .select(
    ["solicitudDeCompra.id",
      "solicitudDeCompra.numOrden",
      
      "numOrdenTrabajo.NumOrden"
    ])
  .where("solicitudDeCompra.id =:id",{id:id})
  .andWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PAR})
  .getOne();

if(!registroEntradaInfo){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }

  const infoParaActaEntrada = {
    ...registroEntradaInfo,
    itemsSolicitados:[
      ...compras
    ]
  }

  return infoParaActaEntrada;
}

async createActaEntrada(id:number,createActaEntradaDto:CreateActaEntradaDto){

     const queryRunner = this.dataSource.createQueryRunner();
   await queryRunner.connect();
   await queryRunner.startTransaction();

   try {

   console.log(id);
     const solMaterial = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
     .leftJoin("solicitudDeCompra.numOrdenTrabajo","numOrdenTrabajo")
     .leftJoin("numOrdenTrabajo.userSolicitante","userSolicitante")
     .leftJoin("solicitudDeCompra.estadoCompra","estadoCompra")
     .select(["solicitudDeCompra.id",
      "numOrdenTrabajo.id",
"userSolicitante.name",
 "estadoCompra.estado"
     ])
   .where('solicitudDeCompra.id = :id',{id:id})
   .andWhere('estadoCompra.estado = :estado',{estado:EstadoCompraEnum.PAR})
   .getOne();

   if(!solMaterial){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }


   const registroEntrada = await queryRunner.manager.count(RegistroEntrada);

   const newNumEntrada = 'AE-'+( registroEntrada+1).toString().padStart(5,'0');

   const findProovedor = await queryRunner.manager.findOne(Proovedores,{where:{id:createActaEntradaDto?.proovedor}});

   if(!findProovedor){
   throw new NotFoundException("No se encontro el proovedor ingresado");
   }

   const newRegistroEntrada = {
    
    factura:createActaEntradaDto?.numFactura,
    numActa:newNumEntrada,
    solicita:solMaterial?.numOrdenTrabajo?.userSolicitante.name,
    proovedor:findProovedor,
    total:createActaEntradaDto?.total,
    numSolicitudCompra:solMaterial
   }

   await queryRunner.manager.save(RegistroEntrada,newRegistroEntrada);

     const findRegistroEntrada = await queryRunner.manager.createQueryBuilder(RegistroEntrada,'registroEntrada')
     .leftJoin("registroEntrada.numSolicitudCompra","solicitudDeCompra")
    
     .select([
      "registroEntrada.id",
      "solicitudDeCompra.id"
     ])
   .where('solicitudDeCompra.id = :id',{id:id})
   .getOne();

   if(!findRegistroEntrada){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }

   for(const item of createActaEntradaDto.itemsSolicitados){
   
    const findItem = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.nombre}});
    if(!findItem){

      const newInventario ={
       nombre:item.nombre,
       stock:item.cantidad,
       costo:item.costo,
       bodega:item.bodega,
       seccion:item.seccion,
       percha:item.percha
      }
    await queryRunner.manager.save(Inventario,newInventario);

    const findNewItem = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.nombre}});
    if(!findNewItem){
   throw new NotFoundException("No se encontro item en inventario");
   }

   const newItemEntrada = {
   stockMin:item.stockMin,
   cantidad:item.cantidad,
   costo:item.costo,
   registroEntrada:findRegistroEntrada,
   item:findNewItem,
   descuento:item.descuento,
   iva:item.iva,
   subtotal:item.subtotal,
   total:item.total
  }

  await queryRunner.manager.save(ItemsEntrada,newItemEntrada);

  // await queryRunner.manager.delete(ItemsSolicitados,{item:item.nombre});

  const itemsSol = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:false, ordenCompra:{id:id}}});
    if(!itemsSol){
   throw new NotFoundException("No se encontro item solicitado");
   }
   itemsSol.existencia = true;
   await queryRunner.manager.save(ItemsSolicitados,itemsSol);

   }
else{

        const updatedStock = findItem.stock + item.cantidad;

    findItem.stock = updatedStock;
    findItem.costo = item.costo; 
    findItem.bodega = item.bodega ?? findItem.bodega;
    findItem.seccion = item.seccion ?? findItem.seccion;
    findItem.percha = item.percha ?? findItem.percha;

    await queryRunner.manager.save(Inventario, findItem);

     const newItemEntrada = {
   stockMin:item.stockMin,
   cantidad:item.cantidad,
   costo:item.costo,
   registroEntrada:findRegistroEntrada,
   item:findItem,
   descuento:item.descuento,
   iva:item.iva,
   subtotal:item.subtotal,
   total:item.total
  }

  await queryRunner.manager.save(ItemsEntrada,newItemEntrada);

  // await queryRunner.manager.delete(ItemsSolicitados,{item:item.nombre});

  const itemsSol = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:false, ordenCompra:{id:id}}});
    if(!itemsSol){
   throw new NotFoundException("No se encontro item solicitado");
   }
   itemsSol.existencia = true;
   await queryRunner.manager.save(ItemsSolicitados,itemsSol);
}
   
   }

   const validarCambiarEstado = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'itemsSolicitados')
   .innerJoin('itemsSolicitados.ordenCompra','ordenCompra')
   .where('ordenCompra.id = :id',{id:solMaterial.id})
   .andWhere('itemsSolicitados.existencia = :ext',{ext:false})
   .getMany();

   if(validarCambiarEstado.length ===0){
     const estadoParcial = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.LIS}});
     if(!estadoParcial){
throw new NotFoundException("No se encontro el estado");
     }
     solMaterial.estadoCompra = estadoParcial;
     await queryRunner.manager.save(solMaterial);
   }
       
    
      await queryRunner.commitTransaction();
return {msj:"Acta de entrada creada",validate:true}
   } catch (error) {
    await  queryRunner.rollbackTransaction();
     console.log(error);
     return {msj:"Error al registrar la acta de entrada",validate:false};
   }finally{
await  queryRunner.release();
}

}

async createActaSalida(id:number,createActaSalidaDto:CreateActaSalidaDto){

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

   const findEntrega = await queryRunner.manager.findOne(User,{where:{id:createActaSalidaDto.entregaId}});

   if(!findEntrega){
   throw new NotFoundException("No se encontro el usuario de entrega");
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
    numSolicitudCompra:solMaterial,
    entrega:findEntrega,
    observacion:createActaSalidaDto.observacion
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

   // await queryRunner.manager.delete(ItemsSolicitados,item.id);

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

   // await queryRunner.manager.delete(ItemsSolicitados,item.id);
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

    async findAllRegistroEntrada() {

     const registroDeEntrada = await this.registroEntradaRepository.createQueryBuilder('registroEntrada')
    .leftJoin('registroEntrada.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroEntrada.proovedor','proovedor')
    .leftJoin('registroEntrada.itemEntrada','itemEntrada')
    .leftJoin('itemEntrada.item','inventario')
    .select([

      'registroEntrada.numActa',
      'registroEntrada.fechaRemision',
      'registroEntrada.factura',
      'registroEntrada.total',
      'userSolicitante.name',
      'proovedor.nombre',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numSolicitudCompra.Destino',
      'inventario.nombre',
      'itemEntrada.cantidad',
      'itemEntrada.costo',
      'itemEntrada.descuento',
      'itemEntrada.iva',
      'itemEntrada.subtotal',
      'itemEntrada.total',
    ])
    
    .getMany();
    if(!registroDeEntrada){
      throw new NotFoundException("No se encontro registro de entrada");
    }
    return registroDeEntrada;
  }

  async actaDeEntradaByIdCompra(id:number) {

     const registroDeEntrada = await this.registroEntradaRepository.createQueryBuilder('registroEntrada')
    .leftJoin('registroEntrada.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroEntrada.proovedor','proovedor')
    .leftJoin('registroEntrada.itemEntrada','itemEntrada')
    .leftJoin('itemEntrada.item','inventario')
    .select([

      'registroEntrada.numActa',
      'registroEntrada.fechaRemision',
      'registroEntrada.factura',
      'registroEntrada.total',
      'userSolicitante.name',
      'proovedor.nombre',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numSolicitudCompra.Destino',
      'inventario.nombre',
      'itemEntrada.cantidad',
      'itemEntrada.costo',
      'itemEntrada.descuento',
      'itemEntrada.iva',
      'itemEntrada.subtotal',
      'itemEntrada.total',
    ])
    .where('numSolicitudCompra.id = :id',{id})
    .getOne();
    if(!registroDeEntrada){
      throw new NotFoundException("No se encontro registro de entrada");
    }
    return registroDeEntrada;

  }

  update(id: number, updateInventarioDto: UpdateInventarioDto) {
    return `This action updates a #${id} inventario`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventario`;
  }
}
