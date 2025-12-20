import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { CreateProovedorDto } from './dto/create-proovedor.dto';
import { AdminService } from 'src/admin/admin.service';
import { Seccion } from 'src/parametro/entities/seccion';
import { Percha } from 'src/parametro/entities/percha';
import { Bodega } from 'src/parametro/entities/bodega';
import { MailService } from 'src/mail/mail.service';
import { FiltrarActaEntradaDto } from './dto/filtrar-acta-entrada.dto';
import { FiltrarActaSalidaDto } from './dto/filtrar-acta-salida.dto';
import { FiltrarInventarioDto } from './dto/filtrar-inventario.dto';

@Injectable()
export class InventarioService {

  constructor(@InjectRepository(Inventario) private readonly inventarioRepository:Repository<Inventario>,
              @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
              @InjectRepository(SolicitudDeCompra) private readonly solicitudDeComprasRepository:Repository<SolicitudDeCompra>,
               @InjectRepository(RegistroSalida) private readonly registroSalidaRepository:Repository<RegistroSalida>,
               @InjectRepository(RegistroEntrada) private readonly registroEntradaRepository:Repository<RegistroEntrada>,
               @InjectRepository(Proovedores) private readonly proovedoresRepository:Repository<Proovedores>,
               @InjectRepository(Bodega) private readonly bodegaRepository:Repository<Bodega>,
               @InjectRepository(Seccion) private readonly seccionRepository:Repository<Seccion>,
               @InjectRepository(Percha) private readonly perchaRepository:Repository<Percha>,
               private readonly mailService:MailService,
                   private readonly adminService: AdminService,
    
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
          console.log(findItem.stock);
 const compras = [
        
        {cantidad:calcStock*(-1),estado:"Por Comprar",validate:false}
       ]

       return {compras,validate:true};
        }else{
           const compras = [
        {cantidad:findItem.stock,estado:"En Stock",validate:true},
        {cantidad:calcStock*(-1),estado:"Por Comprar",validate:false}
       ]

       return {compras,validate:true};
        }
      }

       if(calcStock >= 0){
       const compras = [
        {cantidad:stockDto.cantidad,estado:"En Stock",validate:true}
       ]

       return {compras,validate:true};
      }

}else{
  return{findItem,validate:false}
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
      "itemsSolicitados.existencia"
    ])
  .where("ordenCompra.id =:id",{id:id})
  //.andWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PAR})
 // .orWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PRO})
  .andWhere("itemsSolicitados.existencia =:existencia",{existencia:false})
  .getMany();

if(!registroEntrada){
  console.log("No se encontro una solicitud de material asociada con items solicitados");
   throw new NotFoundException("No se encontro una solicitud de material asociada con items solicitados");
   }

let compras:{}[] =[];

  for(const item of registroEntrada){
     
    const findItem = await this.inventarioRepository.findOne({where:{nombre:item.item}});

   /* if(findItem == null || findItem == undefined){
      console.log("No se encontro una solicitud de material asociada con items solicitados 2");
   throw new NotFoundException("No se encontro una solicitud de material asociada con items solicitados");
   }*/

    if(findItem){
     compras = [...compras,{id:findItem.id,nombre:findItem.nombre,cantidad:item.cantidad,costo:findItem.costo,Observacion:item.Observacion,existencia:item.existencia}]
    }else{
      compras = [...compras,{id:null,nombre:item.item,cantidad:item.cantidad,costo:null,Observacion:item.Observacion,existencia:item.existencia}]
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
  .orWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PAR})
  .orWhere("estadoCompra.estado =:estado",{estado:EstadoCompraEnum.PRO})
  .getOne();

if(!registroEntradaInfo){
  console.log(id);
  console.log("No se encontro una solicitud de material asociada");
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

  console.log(createActaEntradaDto);

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
      "solicitudDeCompra.numOrden",
      "numOrdenTrabajo.id",
"userSolicitante.name",
 "estadoCompra.estado"
     ])
   .where('solicitudDeCompra.id = :id',{id:id})
  /* .orWhere('estadoCompra.estado = :estado',{estado:EstadoCompraEnum.PAR})
   .orWhere('estadoCompra.estado = :estado',{estado:EstadoCompraEnum.PRO})*/
   .getOne();

   if(!solMaterial){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }


   const registroEntrada = await queryRunner.manager.count(RegistroEntrada);

   const newNumEntrada = 'AE-'+( registroEntrada+1).toString().padStart(5,'0');

   const findProovedor = await queryRunner.manager.findOne(Proovedores,{where:{nombreComercial:createActaEntradaDto?.proovedor}});

   if(!findProovedor){
   throw new NotFoundException("No se encontro el proovedor ingresado");
   }

   const newRegistroEntrada = {
    
    factura:createActaEntradaDto?.factura,
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
     
     const bodega = await queryRunner.manager.findOne(Bodega,{where:{id:item.bodegaId}});
    if(!bodega){
   throw new NotFoundException("No se encontro una bodega valida");
   }

    const seccion = await queryRunner.manager.findOne(Seccion,{where:{id:item.seccionId}});
    if(!seccion){
   throw new NotFoundException("No se encontro una seccion valida");
   }

    const percha = await queryRunner.manager.findOne(Percha,{where:{id:item.perchaId}});
    if(!percha){
   throw new NotFoundException("No se encontro una percha valida");
   }


    const findItem = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.nombre}});
    if(!findItem){

      const newInventario ={
       nombre:item.nombre,
       stock:item.cantidad,
       stockMin:item.stockMin,
       costo:item.costo,
       bodega:bodega,
       seccion:seccion,
       percha:percha
      }
    await queryRunner.manager.save(Inventario,newInventario);

    const findNewItem = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.nombre}});
    if(!findNewItem){
   throw new NotFoundException("No se encontro item en inventario");
   }

   const newItemEntrada = {
   
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
    findItem.bodega = bodega ?? findItem.bodega;
    findItem.seccion = seccion ?? findItem.seccion;
    findItem.percha = percha ?? findItem.percha;

    await queryRunner.manager.save(Inventario, findItem);

     const newItemEntrada = {
   
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
       
     await this.mailService.sendEstadoChangeNotification(solMaterial.numOrden, solMaterial.estadoCompra.estado, `Se ha realizado la compra de los items solicitados con falta de stock o nuevos`);
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
    
 const inventario = await queryRunner.manager
    .createQueryBuilder(Inventario, 'inv')
    .where('inv.nombre = :nombre', { nombre: item.item })
    .setLock('pessimistic_write')
    .getOne();

  if (!inventario) {
    throw new NotFoundException(`No se encontro el item en inventario: ${item.item}`);
  }

  const available = inventario.stock;           // >= 0
  const requested = item.cantidad;              // lo que se pidió
  const delivered = Math.min(available, requested); // lo que realmente podemos entregar
  const missing = requested - delivered;        // >= 0

  // 1) Crear ItemsSalida con lo entregado (si delivered > 0)
  if (delivered > 0) {
    const newItemsSalida: CreateItemsSalidaDto = {
      item: item.item,
      cantidad: delivered,
      destino: solMaterial.Destino,
      regSalida: registroSalidaNew ?? registroSalidaCreated, // la que corresponda
      observacion: item.Observacion,
      inventario: inventario
    };
    await queryRunner.manager.save(ItemsSalida, newItemsSalida);

    // reducir stock y guardar
    inventario.stock = inventario.stock - delivered;
    await queryRunner.manager.save(Inventario, inventario);
  }

  // 2) Si falta, sumar o crear ItemsSolicitados con existencia=false
  if (missing > 0) {
    const existingMissing = await queryRunner.manager.findOne(ItemsSolicitados, {
      where: { item: item.item, ordenCompra: { id: solMaterial.id }, existencia: false }
    });

    if (existingMissing) {
      existingMissing.cantidad = (existingMissing.cantidad ?? 0) + missing;
      await queryRunner.manager.save(ItemsSolicitados, existingMissing);
    } else {
      const newItemSol: CreateItemsSolicitadosDto = {
        item: item.item,
        cantidad: missing,
        caracteristica: item.caracteristica,
        Observacion: item.Observacion,
        existencia: false,
        ordenCompra: solMaterial
      };
      await queryRunner.manager.save(ItemsSolicitados, newItemSol);
    }
  }

  // 3) Actualiza el registro original (item) para reflejar lo entregado
  //    (opción: si delivered === 0 podrías eliminarlo o marcar existencia=false)
  item.cantidad = delivered;
  item.existencia = delivered > 0;
  await queryRunner.manager.save(ItemsSolicitados, item);
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

       const newInventario = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.item}});
      if(!newInventario){
    throw new NotFoundException("No se encontro el item en inventario");
    }


  /*   const newInventario = await queryRunner.manager.findOne(Inventario,{where:{nombre:item.item}});

    if(!newInventario){
    throw new NotFoundException("No se encontrol el item en inventario");
    }*/
    
    const newStock = newInventario.stock - item.cantidad;

    if(newStock <0 ){
       const itemsSolSinExistencia = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.item,ordenCompra:{id:solMaterial.id},existencia:false}});

     if(itemsSolSinExistencia === null){
    throw new NotFoundException("Hubo un error al encontrar item solicitados sin existencia");
    }

    if(itemsSolSinExistencia){
        const newItemSolSinExistencia = {
   
   cantidad:newStock+itemsSolSinExistencia.cantidad,

  }

  await queryRunner.manager.update(ItemsSolicitados,{ id:itemsSolSinExistencia.id},newItemSolSinExistencia);
    }else{
          const newItemSol:CreateItemsSolicitadosDto = {
      item:item.item,
      cantidad:newStock,
      caracteristica:item.caracteristica,
      Observacion:item.Observacion,
      existencia:false,
      ordenCompra:solMaterial
   }

   await queryRunner.manager.save(ItemsSolicitados,newItemSol);
    }
         
    const newItemsSalida:CreateItemsSalidaDto = {
       item:item.item,
       cantidad:newInventario.stock,
       destino:solMaterial.Destino,
       regSalida:registroSalidaCreated,
       observacion:item.Observacion,
       inventario:newInventario
    }

    await queryRunner.manager.save(ItemsSalida,newItemsSalida);
    newInventario.stock = 0;

    await queryRunner.manager.save(newInventario);
    }else{

      const newItemsSalida:CreateItemsSalidaDto = {
       item:item.item,
       cantidad:item.cantidad,
       destino:solMaterial.Destino,
       regSalida:registroSalidaCreated,
       observacion:item.Observacion,
       inventario:newInventario
    }

    await queryRunner.manager.save(ItemsSalida,newItemsSalida);
      newInventario.stock = newStock;

    await queryRunner.manager.save(newInventario);
    }

    

   // await queryRunner.manager.delete(ItemsSolicitados,item.id);
   }
const estadoEntregado = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.ENT}});
     if(!estadoEntregado){
throw new NotFoundException("No se encontro el estado");
     }
     solMaterial.estadoCompra = estadoEntregado;
     await queryRunner.manager.save(solMaterial);
   }


      const verificarEstadoSolMaterial = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
   .leftJoinAndSelect('solicitudDeCompra.estadoCompra','estadoCompra')   
   .leftJoinAndSelect('solicitudDeCompra.numOrdenTrabajo','ordenTrabajo')  
   .where('solicitudDeCompra.id = :id',{id:id})
   .getOne();

      if(!verificarEstadoSolMaterial){
   throw new NotFoundException("No se encontro una solicitud de material asociada");
   }
   
const zeroInventarios = await queryRunner.manager.find(Inventario, {
  where: { stock: 0 },
  select: ['id', 'nombre'],
});

let nombresVacios: string[] = [];

if (zeroInventarios.length > 0) {
  for (const inv of zeroInventarios) {
    
    await queryRunner.manager.update(
      ItemsSolicitados,
      { item: inv.nombre, existencia: true },
      { existencia: false }
    );

    nombresVacios.push(inv.nombre);
  }
} 

    await queryRunner.commitTransaction();

    if (nombresVacios.length > 0) {
  await this.mailService.sendNotificationStockVacio(nombresVacios);
}





   if(verificarEstadoSolMaterial.estadoCompra.estado === EstadoCompraEnum.PAR){
    await this.mailService.sendEstadoChangeNotification(solMaterial.numOrden, verificarEstadoSolMaterial.estadoCompra.estado, `Se ha realizado una acta de salida parcial por lo que aun hace falta material para la completa realizacion del trabajo #${verificarEstadoSolMaterial.numOrdenTrabajo.NumOrden}`);
   }

    if(verificarEstadoSolMaterial.estadoCompra.estado === EstadoCompraEnum.ENT){
    await this.mailService.sendEstadoChangeNotification(solMaterial.numOrden, verificarEstadoSolMaterial.estadoCompra.estado, `Se ha realizado la completa entrega de los items solicitados para la realizacion del trabajo #${verificarEstadoSolMaterial.numOrdenTrabajo.NumOrden}`);
   }

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

    const inventarios = await this.inventarioRepository.find({relations:['bodega']});
    if(inventarios === null|| inventarios === undefined){
      return new NotFoundException("No se encontro inventarios");
    }
    return inventarios;
  }



 async filtrarInventario(item: string) {

    const inventario = await this.inventarioRepository.find({where:{nombre:Like(`${item}%`)},select:['id','nombre','stock']});

    return inventario;
  }

  async existeItem(item:string) {
console.log(item);
    const findItem = await this.inventarioRepository.findOne({where:{nombre:item}});
console.log(findItem);
    if(findItem){
       return true;
    }
    return false;
  }

  async actaDeSalidaByIdCompra(id:number) {
   
  console.log('ID de la acta de salida:', id);

    const registroDeSalida = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
    .leftJoin('registroSalida.itemSalida','itemSalida')
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroSalida.entrega','entrega')
    .leftJoin('itemSalida.inventario','inventario')
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
         'inventario.id',
         'inventario.nombre',
      'inventario.costo',
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
     console.log(id);
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

  async findProovedorByNombre(nombre:string) {
    
    const proovedores = await this.proovedoresRepository.find({where:{nombreComercial : Like(`${nombre}%`)},select:["id","nombreComercial"]});
   
    
    return proovedores;
  }

  async createProovedor(createProovedorDto:CreateProovedorDto){
 
const existe = await this.proovedoresRepository.findOne({
    where: { ruc: createProovedorDto.ruc },
  });

  if (existe) {
    throw new BadRequestException('El RUC ya está registrado');
  }

    const createProov = this.proovedoresRepository.create(createProovedorDto);
    await this.proovedoresRepository.save(createProov);
    return{
      ok:true,
      message:"Proovedor registrado!"
    }

  }

async findSeccionesByBodega(
  bodegaId: number
): Promise<{ id: number; seccion: string }[]> {
  return await this.seccionRepository.find({
    where: { bodega: { id: bodegaId } },
    select: ['id', 'seccion'],
    order: { seccion: 'ASC' },
  });
}

async findPerchasBySeccion(
  seccionId: number
): Promise<{ id: number; percha: string }[]> {
  return await this.perchaRepository.find({
    where: { seccion: { id: seccionId } },
    select: ['id', 'percha'],
    order: { percha: 'ASC' },
  });
}
async precargarBodegas(){
   return await this.adminService.findAllBodegas();
}

async filtrarActasEntrada(filtros: FiltrarActaEntradaDto) {
  const qb = this.registroEntradaRepository.createQueryBuilder('registroEntrada')
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
      'itemEntrada.total'
    ]);

  if (filtros.numActa) {
    qb.andWhere('registroEntrada.numActa LIKE :numActa', { numActa: `%${filtros.numActa}%` });
  }
  if (filtros.fechaRemision) {
    qb.andWhere('DATE(registroEntrada.fechaRemision) = :fechaRemision', { fechaRemision: filtros.fechaRemision });
  }
  if (filtros.factura) {
    qb.andWhere('registroEntrada.factura LIKE :factura', { factura: `%${filtros.factura}%` });
  }
  if (filtros.recibe) {
    qb.andWhere('userSolicitante.name LIKE :recibe', { recibe: `%${filtros.recibe}%` });
  }
  if (filtros.destino) {
    qb.andWhere('numSolicitudCompra.Destino LIKE :destino', { destino: `%${filtros.destino}%` });
  }
  if (filtros.proveedor) {
    qb.andWhere('proovedor.nombreComercial LIKE :proveedor', { proveedor: `%${filtros.proveedor}%` });
  }
  if (filtros.numSolicitudCompraId) {
    qb.andWhere('numSolicitudCompra.id = :id', { id: filtros.numSolicitudCompraId });
  }
  if (filtros.numOrdenTrabajoId) {
    qb.andWhere('numOrdenTrabajo.id = :otId', { otId: filtros.numOrdenTrabajoId });
  }


  const resultados = await qb.getMany();
  return resultados;
}

async filtrarActasSalida(filtros: FiltrarActaSalidaDto) {
  const qb = this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroSalida.entrega','entregaUser')
    .leftJoin('registroSalida.itemSalida','itemSalida')
    .leftJoin('itemSalida.inventario','inventario')
    .select([
      'registroSalida.numActa',
      'registroSalida.fechaRemision',
      'userSolicitante.name',
      'entregaUser.id',
      'entregaUser.name',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numSolicitudCompra.Destino',
      'itemSalida.item',
      'itemSalida.cantidad',
      'itemSalida.Observacion',
      'inventario.id',
      'inventario.nombre'
    ]);

  if (filtros.numActa) {
    qb.andWhere('registroSalida.numActa LIKE :numActa', { numActa: `%${filtros.numActa}%` });
  }
  if (filtros.fechaRemision) {
    qb.andWhere('DATE(registroSalida.fechaRemision) = :fechaRemision', { fechaRemision: filtros.fechaRemision });
  }
  if (filtros.recibe) {
    qb.andWhere('userSolicitante.name LIKE :recibe', { recibe: `%${filtros.recibe}%` });
  }
  if (filtros.entrega) {
    qb.andWhere('entregaUser.name LIKE :entrega', { entrega: `%${filtros.entrega}%` });
  }
  if (filtros.destino) {
    qb.andWhere('numSolicitudCompra.Destino LIKE :destino', { destino: `%${filtros.destino}%` });
  }
  if (filtros.numSolicitudCompraId) {
    qb.andWhere('numSolicitudCompra.id = :id', { id: filtros.numSolicitudCompraId });
  }
  if (filtros.numOrdenTrabajoId) {
    qb.andWhere('numOrdenTrabajo.id = :otId', { otId: filtros.numOrdenTrabajoId });
  }

  const resultados = await qb.getMany();
  return resultados;
}

async filtrarInventarios(filtros: FiltrarInventarioDto) {
  const qb = this.inventarioRepository.createQueryBuilder('inventario')
    .leftJoin('inventario.bodega', 'bodega')
    .leftJoin('inventario.seccion', 'seccion')
    .leftJoin('inventario.percha', 'percha')
    .select([
      'inventario.id',
      'inventario.nombre',
      'inventario.stock',
      'inventario.stockMin',
      'inventario.costo',
      'inventario.estado',
      'bodega.id',
      'bodega.bodega',
      'seccion.id',
      'seccion.seccion',
      'percha.id',
      'percha.percha'
    ]);

  if (filtros.nombre) {
    qb.andWhere('inventario.nombre LIKE :nombre', { nombre: `${filtros.nombre}%` });
  }
  if (filtros.bodega) {
    
    qb.andWhere('bodega.bodega LIKE :bodega', { bodega: `${filtros.bodega}%` });
  }
  if (typeof filtros.seccionId === 'number') {
    qb.andWhere('seccion.id = :seccionId', { seccionId: filtros.seccionId });
  }
  if (typeof filtros.perchaId === 'number') {
    qb.andWhere('percha.id = :perchaId', { perchaId: filtros.perchaId });
  }
  if (typeof filtros.stockMin === 'number') {
    qb.andWhere('inventario.stock >= :stockMin', { stockMin: filtros.stockMin });
  }
  if (typeof filtros.stockMax === 'number') {
    qb.andWhere('inventario.stock <= :stockMax', { stockMax: filtros.stockMax });
  }
  if (typeof filtros.activo === 'boolean') {
    qb.andWhere('inventario.estado = :estado', { estado: filtros.activo });
  }

  const resultados = await qb.getMany();
  return resultados;
}




  update(id: number, updateInventarioDto: UpdateInventarioDto) {
    return `This action updates a #${id} inventario`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventario`;
  }
}
