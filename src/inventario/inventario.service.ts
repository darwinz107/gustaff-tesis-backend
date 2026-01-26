import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Not, Repository } from 'typeorm';
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
import { UpdateActaSalidaDto } from './dto/update-acta-salida.dto';
import { EstadoCompraEnum } from 'src/solicitud-de-compra/enums/estadoCompra.enum';
import { CreateActaEntradaDto } from './dto/create-acta-entrada.dto';
import { UpdateActaEntradaDto } from './dto/update-acta-entrada.dto';
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
import { CreateActaSalidaSinSMDto } from './dto/create-acta-salida-sm.dto';
import { CreateItemsSalidaSinSMDto } from './dto/create-items-salida-sinSM.dto';
import { Maquina } from 'src/parametro/entities/maquina.entity';


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
        
        {cantidad:calcStock*(-1),estado:"No disponible",validate:false}
       ]

       return {compras,validate:true};
        }else{
           const compras = [
        {cantidad:findItem.stock,estado:"En Stock",validate:true},
        {cantidad:calcStock*(-1),estado:"No disponible",validate:false}
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
let solMaterial: SolicitudDeCompra | null = null;
   console.log(id);
     const queryMaterial = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
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

   if(queryMaterial){
    solMaterial = queryMaterial;
   }


    const countReg = await queryRunner.manager.find(RegistroEntrada,{take:1,order:{id:"DESC"}});
      const nextId = countReg && countReg.length > 0 ? countReg[0].id + 1 : 1;

   const newNumEntrada = 'AE-'+nextId.toString().padStart(5,'0');

   const findProovedor = await queryRunner.manager.findOne(Proovedores,{where:{nombreComercial:createActaEntradaDto?.proovedor}});

   if(!findProovedor){
   throw new NotFoundException("No se encontro el proovedor ingresado");
   }

   const registroExistente = await queryRunner.manager.findOne(User,{where:{id:createActaEntradaDto?.recibe}});
    if(!registroExistente){
    throw new NotFoundException("No se encontro el usuario que recibe");
    }
 
   const newRegistroEntrada = {
    
    factura:createActaEntradaDto?.factura,
    numActa:newNumEntrada,
    solicita:solMaterial?.numOrdenTrabajo?.userSolicitante ?? solMaterial?.numOrdenTrabajo?.userSolicitante?.name ?? null,
    proovedor:findProovedor,
    recibe:registroExistente,
    total:createActaEntradaDto?.total,
    numSolicitudCompra:solMaterial
   }

   await queryRunner.manager.save(RegistroEntrada,newRegistroEntrada);

     const query = await queryRunner.manager.createQueryBuilder(RegistroEntrada,'registroEntrada')
     .leftJoin("registroEntrada.numSolicitudCompra","solicitudDeCompra")
    
     .select([
      "registroEntrada.id",
      "solicitudDeCompra.id"
     ]);

     if(solMaterial){
 query.where('solicitudDeCompra.id = :id',{id:id});
     }else{
   query.where('registroEntrada.factura = :factura',{factura:createActaEntradaDto.factura});
     }
    const findRegistroEntrada =  await query.getOne();
   

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
       percha:percha,
       imagen: item.imagen ?? null,
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
   Observacion:item.Observacion,
   total:item.total
  }

  await queryRunner.manager.save(ItemsEntrada,newItemEntrada);

  // await queryRunner.manager.delete(ItemsSolicitados,{item:item.nombre});

  if(id !=0){
  const itemsSol = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:false, ordenCompra:{id:id}}});
    if(!itemsSol){
   throw new NotFoundException("No se encontro item solicitado");
   }
   
   // Buscar si existe otro item con existencia TRUE y mismo item/ordenCompra
   const itemsSolTrue = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:true, ordenCompra:{id:id}, id:Not(itemsSol.id)}});
   
   if(itemsSolTrue){
     // Si existe, sumar cantidades y eliminar el FALSE
     itemsSolTrue.cantidad += itemsSol.cantidad;
     await queryRunner.manager.save(ItemsSolicitados,itemsSolTrue);
     await queryRunner.manager.delete(ItemsSolicitados,{id:itemsSol.id});
   }else{
     // Si no existe, solo cambiar existencia a TRUE
     itemsSol.existencia = true;
     await queryRunner.manager.save(ItemsSolicitados,itemsSol);
   }

   } }
else{

        const updatedStock = findItem.stock + item.cantidad;

    findItem.stock = updatedStock;
    findItem.costo = item.costo ??findItem.costo; 
    findItem.bodega = bodega ?? findItem.bodega;
    findItem.seccion = seccion ?? findItem.seccion;
    findItem.percha = percha ?? findItem.percha;
    findItem.imagen = item.imagen ?? findItem.imagen;

    await queryRunner.manager.save(Inventario, findItem);

     const newItemEntrada = {
   
   cantidad:item.cantidad,
   costo:item.costo,
   registroEntrada:findRegistroEntrada,
   item:findItem,
   descuento:item.descuento,
   iva:item.iva,
   subtotal:item.subtotal,
   Observacion:item.Observacion,
   total:item.total
  }

  await queryRunner.manager.save(ItemsEntrada,newItemEntrada);

  // await queryRunner.manager.delete(ItemsSolicitados,{item:item.nombre});
 if(id !=0){
  const itemsSol = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:false, ordenCompra:{id:id}}});
    if(!itemsSol){
   throw new NotFoundException("No se encontro item solicitado");
   }
   
   // Buscar si existe otro item con existencia TRUE y mismo item/ordenCompra
   const itemsSolTrue = await queryRunner.manager.findOne(ItemsSolicitados,{where:{item:item.nombre, existencia:true, ordenCompra:{id:id}, id:Not(itemsSol.id)}});
   
   if(itemsSolTrue){
     // Si existe, sumar cantidades y eliminar el FALSE
     itemsSolTrue.cantidad += itemsSol.cantidad;
     await queryRunner.manager.save(ItemsSolicitados,itemsSolTrue);
     await queryRunner.manager.delete(ItemsSolicitados,{id:itemsSol.id});
   }else{
     // Si no existe, solo cambiar existencia a TRUE
     itemsSol.existencia = true;
     await queryRunner.manager.save(ItemsSolicitados,itemsSol);
   }
}
}
   
   }
if(solMaterial){
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
}
  
       await queryRunner.commitTransaction();
       if(solMaterial){
         await this.mailService.sendEstadoChangeNotification(solMaterial.numOrden, solMaterial.estadoCompra.estado, `Se ha realizado la compra de los items solicitados con falta de stock o nuevos`);
       }else{
        await this.mailService.sendEstadoChangeNotification(null, null, `Se ha ingresado ${createActaEntradaDto.itemsSolicitados.map(i=>i.nombre).join(", ")} a inventario para abastecimiento`);
       }
 
return {msj:"Acta de entrada creada",validate:true}
   } catch (error) {
    await  queryRunner.rollbackTransaction();
     console.log(error);
     return {msj:"Error al registrar la acta de entrada",validate:false};
   }finally{
await  queryRunner.release();
}

}

async createActaSalida(id:number, createActaSalidaDto:CreateActaSalidaDto) {
console.log(createActaSalidaDto);
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    
    const solMaterial = await queryRunner.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
      .where('solicitudDeCompra.id = :id',{id})
      .getOne();

    if (!solMaterial) throw new NotFoundException("No se encontro una solicitud de material asociada");

    const itemsSolicitados = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'itemsSolicitados')
      .innerJoin('itemsSolicitados.ordenCompra','ordenCompra')
      .where('ordenCompra.id = :id',{id: solMaterial.id})
      .andWhere('itemsSolicitados.existencia = :ext',{ext:true})
      .getMany();

    if (!itemsSolicitados || itemsSolicitados.length === 0) {
      throw new NotFoundException("No se encontro ningun item para salida");
    }

    const findEntrega = await queryRunner.manager.findOne(User,{where:{id:createActaSalidaDto.entregaId}});
    if (!findEntrega) throw new NotFoundException("No se encontro el usuario de entrega");

    const findRecibe = await queryRunner.manager.findOne(User,{where:{id:createActaSalidaDto.recibe}});
    if (!findRecibe) throw new NotFoundException("No se encontro el usuario que recibe");
    
    let registroSalida = await queryRunner.manager.createQueryBuilder(RegistroSalida,'registroSalida')
      .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
      .where('numSolicitudCompra.id = :id',{id: solMaterial.id})
      .getOne();

    if (!registroSalida) {
     
      const countReg = await queryRunner.manager.find(RegistroSalida,{take:1,order:{id:'DESC'}});
      const nextId = countReg && countReg.length > 0 ? countReg[0].id + 1 : 1;
      const newNumSalida = 'AS-' + nextId.toString().padStart(5, '0');

      const totalItems = itemsSolicitados.reduce((s, it) => s + it.cantidad, 0);

      const newRegistroSalida:CreateRegistroSalidaDto = {
        numActa: newNumSalida,
        total: totalItems,
        numSolicitudCompra: solMaterial,
        entrega: findEntrega,
        observacion: createActaSalidaDto.observacion,
        descripcion:undefined,
        recibeSinSM:findRecibe
      };

      await queryRunner.manager.save(RegistroSalida, newRegistroSalida);

      registroSalida = await queryRunner.manager.createQueryBuilder(RegistroSalida,'registroSalida')
        .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
        .where('numSolicitudCompra.id = :id',{id: solMaterial.id})
        .getOne();

      if (!registroSalida) throw new NotFoundException('Fallo al encontrar el registro de salida');
    }

    
    for (const item of itemsSolicitados) {
      
      const inventario = await queryRunner.manager
        .createQueryBuilder(Inventario, 'inv')
        .where('inv.nombre = :nombre', { nombre: item.item })
        .setLock('pessimistic_write')
        .getOne();

      if (!inventario) throw new NotFoundException(`No se encontro el item en inventario: ${item.item}`);

      const available = inventario.stock ?? 0;
      const requested = item.cantidad ?? 0;
      const delivered = Math.min(available, requested);
      const missing = requested - delivered; 

      
      if (delivered > 0) {
        const newItemsSalida: CreateItemsSalidaDto = {
          item: item.item,
          cantidad: delivered,
         // destino: solMaterial.Destino,
          regSalida: registroSalida,
          Observacion: item.Observacion,
          inventario: inventario,
          caracteristica:item.caracteristica
        };
        await queryRunner.manager.save(ItemsSalida, newItemsSalida);

       
        inventario.stock = inventario.stock - delivered;
        await queryRunner.manager.save(Inventario, inventario);
      }

    
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

     
      item.cantidad = delivered;
      item.existencia = true;
      await queryRunner.manager.save(ItemsSolicitados, item);
    }

    
    const faltantes = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'itemsSolicitados')
      .innerJoin('itemsSolicitados.ordenCompra','ordenCompra')
      .where('ordenCompra.id = :id',{id: solMaterial.id})
      .andWhere('itemsSolicitados.existencia = :ext',{ext:false})
      .getCount();

    if (faltantes > 0) {
      const estadoParcial = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.PAR}});
      if (!estadoParcial) throw new NotFoundException("No se encontro el estado PAR");
      solMaterial.estadoCompra = estadoParcial;
    } else {
      const estadoEntregado = await queryRunner.manager.findOne(EstadoCompra,{where:{estado:EstadoCompraEnum.ENT}});
      if (!estadoEntregado) throw new NotFoundException("No se encontro el estado ENT");
      solMaterial.estadoCompra = estadoEntregado;
    }
    await queryRunner.manager.save(solMaterial);

    
    const zeroInventarios = await queryRunner.manager.find(Inventario, {
      where: { stock: 0 },
      select: ['id','nombre'],
    });




let nombresVacios: string[] = [];
if (zeroInventarios.length > 0) {
  for (const inv of zeroInventarios) {
    

    // NUEVA LÓGICA - COMENTADA PARA VALIDACIÓN:
    // 1. Primero, poner existencia false a todos los itemSolicitados con este item

    const actualizarItems = await queryRunner.manager.createQueryBuilder(ItemsSolicitados,'ItemsSolicitados')
      .leftJoin('ItemsSolicitados.ordenCompra', 'ordenCompra')
      .leftJoin('ordenCompra.estadoCompra', 'estadoCompra')
      .where('ItemsSolicitados.item = :item AND ItemsSolicitados.existencia = :ext AND estadoCompra.estado != :estado', {
        item: inv.nombre,
        ext: true,
        estado: EstadoCompraEnum.ENT 
      })
      .getMany();
  if (actualizarItems.length > 0) {
      await queryRunner.manager.update(ItemsSolicitados, actualizarItems.map(i => i.id), { existencia: false });
    }
     

    // 2. Buscar todos los itemSolicitados con este item (en todas las órdenes de compra)
     const allItemsConEsteNombre = await queryRunner.manager.find(ItemsSolicitados, {
       where: { item: inv.nombre },relations: ['ordenCompra','ordenCompra.estadoCompra']
     });

    // 3. Agrupar por ordenCompraId
     const itemsAgrupadosPorOrden = new Map<number, ItemsSolicitados[]>();
     for (const item of allItemsConEsteNombre) {
      if(item.ordenCompra?.estadoCompra?.estado === EstadoCompraEnum.ENT) continue; // Ignorar órdenes ya entregadas
       const ordenId = item.ordenCompra?.id;
       if (ordenId) {
         if (!itemsAgrupadosPorOrden.has(ordenId)) {
           itemsAgrupadosPorOrden.set(ordenId, []);
         }
         
         itemsAgrupadosPorOrden.get(ordenId)?.push(item);
       }
     }

    // 4. Por cada ordenCompra, validar si hay duplicados con existencia false y fusionarlos
     for (const [ordenId, items] of itemsAgrupadosPorOrden.entries()) {
    //   // Filtrar items sin existencia
       const itemsSinExistencia = items.filter(i => i.existencia === false);
       
       if (itemsSinExistencia.length > 1) {
    //     // Hay duplicados sin existencia, fusionarlos
         const itemPrincipal = itemsSinExistencia[0];
         let cantidadTotal = itemPrincipal.cantidad || 0;
    
    //     // Sumar cantidades de los demás y eliminarlos
         for (let i = 1; i < itemsSinExistencia.length; i++) {
           cantidadTotal += itemsSinExistencia[i].cantidad || 0;
           await queryRunner.manager.remove(ItemsSolicitados, itemsSinExistencia[i]);
         }
    
    //     // Actualizar el item principal con la cantidad total
         itemPrincipal.cantidad = cantidadTotal;
         await queryRunner.manager.save(ItemsSolicitados, itemPrincipal);
       }
     }

    // LÓGICA ORIGINAL :
   /* await queryRunner.manager.createQueryBuilder()
      .update(ItemsSolicitados)
      .set({ existencia: false })
      .where('item = :item AND ordenCompraId = :ordenId AND existencia = :ext', {
        item: inv.nombre,
        ordenId: solMaterial.id,
        ext: true
      })
      .execute(); */

    nombresVacios.push(inv.nombre);
  }
}
    
    await queryRunner.commitTransaction();

    
    if (nombresVacios.length > 0) {
      await this.mailService.sendNotificationStockVacio(nombresVacios);
    }

    
    const verificarEstadoSolMaterial = await this.dataSource.manager.createQueryBuilder(SolicitudDeCompra,'solicitudDeCompra')
      .leftJoinAndSelect('solicitudDeCompra.estadoCompra','estadoCompra')
      .leftJoinAndSelect('solicitudDeCompra.numOrdenTrabajo','numOrdenTrabajo')
      .where('solicitudDeCompra.id = :id',{id: solMaterial.id})
      .getOne();

    if (verificarEstadoSolMaterial?.estadoCompra?.estado === EstadoCompraEnum.PAR) {
      await this.mailService.sendEstadoChangeNotification(
        solMaterial.numOrden,
        verificarEstadoSolMaterial.estadoCompra.estado,
        `Se ha realizado una acta de salida parcial por lo que aun hace falta material para la completa realizacion del trabajo #${verificarEstadoSolMaterial.numOrdenTrabajo.NumOrden}`
      );
    }

    if (verificarEstadoSolMaterial?.estadoCompra?.estado === EstadoCompraEnum.ENT) {
      await this.mailService.sendEstadoChangeNotification(
        solMaterial.numOrden,
        verificarEstadoSolMaterial.estadoCompra.estado,
        `Se ha realizado la completa entrega de los items solicitados para la realizacion del trabajo #${verificarEstadoSolMaterial.numOrdenTrabajo.NumOrden}`
      );
    }

    return { msj: "Acta de salida creada", validate: true };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(error);
    return { msj: "Error al registrar la acta de salida", validate: false };
  } finally {
    await queryRunner.release();
  }
}

async createActaSalidaSinSM(createActaSalidaSinSMDto:CreateActaSalidaSinSMDto) {
  console.log(createActaSalidaSinSMDto);
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
  

    const findEntrega = await queryRunner.manager.findOne(User,{where:{id:createActaSalidaSinSMDto.entregaId}});
    if (!findEntrega) throw new NotFoundException("No se encontro el usuario de entrega");

    const findRecibe = await queryRunner.manager.findOne(User,{where:{id:createActaSalidaSinSMDto.recibeId}});
    if (!findRecibe) throw new NotFoundException("No se encontro el usuario que recibe");

     
      const countReg = await queryRunner.manager.find(RegistroSalida,{take:1,order:{id:"DESC"}});
      const nextId = countReg && countReg.length > 0 ? countReg[0].id + 1 : 1;
      const newNumSalida = 'AS-' + nextId.toString().padStart(5, '0');

      const totalItems = createActaSalidaSinSMDto.itemsSalida.reduce((s, it) => s + it.cantidad, 0);

      const newRegistroSalida: CreateRegistroSalidaDto = {
        numActa: newNumSalida,
        total: totalItems,
        numSolicitudCompra: null,
        entrega: findEntrega,
        recibeSinSM:findRecibe,
        observacion: createActaSalidaSinSMDto.observacion,
        descripcion:createActaSalidaSinSMDto.descripcion
      };

     const registrCreated = await queryRunner.manager.save(RegistroSalida, newRegistroSalida);

   
    
    for (const item of createActaSalidaSinSMDto.itemsSalida) {
      
      const inventario = await queryRunner.manager
        .createQueryBuilder(Inventario, 'inv')
        .where('inv.nombre = :nombre', { nombre: item.item })
        .setLock('pessimistic_write')
        .getOne();

      if (!inventario) throw new NotFoundException(`No se encontro el item en inventario: ${item.item}`);

      const available = inventario.stock ?? 0;
      const requested = item.cantidad ?? 0;
      const delivered = Math.min(available, requested);
      const missing = requested - delivered; 

      
      if (delivered > 0) {
        const newItemsSalida :CreateItemsSalidaDto = {
          item: item.item,
          cantidad: delivered,
         
          regSalida: registrCreated,
          Observacion: item.Observacion,         
          inventario: inventario,
          caracteristica:item.caracteristica
        };
        await queryRunner.manager.save(ItemsSalida, newItemsSalida);

       
        inventario.stock = inventario.stock - delivered;
        await queryRunner.manager.save(Inventario, inventario);
      }

    }
    
    const zeroInventarios = await queryRunner.manager.find(Inventario, {
      where: { stock: 0 },
      select: ['id','nombre'],
    });


let nombresVacios: string[] = [];
if (zeroInventarios.length > 0) {
  for (const inv of zeroInventarios) {

    nombresVacios.push(inv.nombre);
  }
}
    
    await queryRunner.commitTransaction();

    
    if (nombresVacios.length > 0) {
      await this.mailService.sendNotificationStockVacio(nombresVacios);
    }
 
    await this.mailService.sendActaSalidaSinOrden(newNumSalida);

    return { msj: "Acta de salida creada", validate: true };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(error);
    return { msj: "Error al registrar la acta de salida", validate: false };
  } finally {
    await queryRunner.release();
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

    const inventarios = await this.inventarioRepository.find({relations:['bodega','seccion','percha']});
    if(inventarios === null|| inventarios === undefined){
      return new NotFoundException("No se encontro inventarios");
    }
    return inventarios;
  }



 async filtrarInventario(item: string) {

    const inventario = await this.inventarioRepository.find({where:{nombre:Like(`${item}%`)},select:['id','nombre','stock','costo']});

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

  async actaDeSalidaByIdCompra(id?: number) {
  
  const hasValidId = typeof id === 'number' && !Number.isNaN(id);

  
  let registroBase: RegistroSalida | null = null;

  if (hasValidId) {
    registroBase = await this.registroSalidaRepository.findOne({
      where: { id },
      relations: ['numSolicitudCompra'],
    });
  } else {
    const arr = await this.registroSalidaRepository.find({
      take: 1,
      order: { id: 'DESC' },
      relations: ['numSolicitudCompra'],
    });
    registroBase = arr[0] ?? null;
  }

  if (!registroBase) {
    throw new NotFoundException('No se encontró registro de salidas');
  }

  const qb = this.registroSalidaRepository
    .createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.itemSalida', 'itemSalida')
    .leftJoin('registroSalida.entrega', 'entrega')
    .leftJoin('itemSalida.inventario', 'inventario');

  
    qb.leftJoin('registroSalida.numSolicitudCompra', 'numSolicitudCompra')
      .leftJoin('numSolicitudCompra.numOrdenTrabajo', 'numOrdenTrabajo')
      .leftJoin('numOrdenTrabajo.userSolicitante', 'userSolicitante')
      .leftJoin('registroSalida.recibeSinSM', 'recibe')
      .select([
        'registroSalida.id',
        'registroSalida.numActa',
        'registroSalida.fechaRemision',
        'registroSalida.descripcion',
        'userSolicitante.id',
        'userSolicitante.name',
         'recibe.id',
        'recibe.name',
        'entrega.name',
        'numSolicitudCompra.id',
        'numOrdenTrabajo.id',
        'numOrdenTrabajo.DescripcionTrabajo',
        'itemSalida.item',
        'itemSalida.cantidad',
        'itemSalida.Observacion',
        'inventario.id',
        'inventario.nombre',
        'inventario.costo',
      ]);
  

  
  qb.where('registroSalida.id = :id', { id: registroBase.id });

  return qb.getOne();
}


  async findAllRegistroSalida() {

     const registroDeSalida = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoin('registroSalida.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroSalida.recibeSinSM','recibeSinSM')
    .leftJoin('registroSalida.entrega','entrega')
    .select([
      'registroSalida.id',
      'registroSalida.numActa',
      'registroSalida.fechaRemision',
      'registroSalida.observacion',
      'registroSalida.descripcion',
      'userSolicitante.id',
      'userSolicitante.name',
      'entrega.id',
      'entrega.name',
      'recibeSinSM.id',
      'recibeSinSM.name',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numOrdenTrabajo.DescripcionTrabajo'
    ])
    .orderBy('registroSalida.id','DESC')
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
       'registroEntrada.id',
      'registroEntrada.numActa',
      'registroEntrada.fechaRemision',
      'registroEntrada.factura',
     'proovedor.id',
      'proovedor.nombreComercial',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numOrdenTrabajo.DescripcionTrabajo',    
    ])
    .orderBy('registroEntrada.id','DESC')
    .getMany();
    if(!registroDeEntrada){
      throw new NotFoundException("No se encontro registro de entrada");
    }
    return registroDeEntrada;
  }

      async findRegistroEntradaById(id:number) {

     const registroDeEntrada = await this.registroEntradaRepository.createQueryBuilder('registroEntrada')
    .leftJoin('registroEntrada.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroEntrada.proovedor','proovedor')
    .leftJoin('registroEntrada.recibe','recibe')
    .leftJoin('registroEntrada.itemEntrada','itemEntrada')
    .leftJoin('itemEntrada.item','inventario')
    .select([
       'registroEntrada.id',
      'registroEntrada.numActa',
      'registroEntrada.fechaRemision',
      'registroEntrada.factura',
      'registroEntrada.total',
      'userSolicitante.name',
      'proovedor.id',
       'recibe.id',
      'recibe.name',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numOrdenTrabajo.DescripcionTrabajo',
       
      'inventario.nombre',
      'itemEntrada.cantidad',
      'itemEntrada.costo',
      'itemEntrada.descuento',
      'itemEntrada.iva',
      'itemEntrada.subtotal',
      'itemEntrada.total',
    ])
    .where('registroEntrada.id = :id',{id:id})
    .getOne();
    if(!registroDeEntrada){
      throw new NotFoundException("No se encontro registro de entrada");
    }
    return registroDeEntrada;
  }

  async findRegistroSalidaById(id: number) {
    const registroDeSalida = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
      .leftJoin('registroSalida.numSolicitudCompra', 'numSolicitudCompra')
      .leftJoin('numSolicitudCompra.numOrdenTrabajo', 'numOrdenTrabajo')
      .leftJoin('numOrdenTrabajo.userSolicitante', 'userSolicitante')
      .leftJoin('registroSalida.entrega', 'entrega')
      .leftJoin('registroSalida.recibeSinSM', 'recibeSinSM')
      .leftJoin('registroSalida.itemSalida', 'itemSalida')
      .leftJoin('itemSalida.inventario', 'inventario')
      .select([
        'registroSalida.id',
        'registroSalida.numActa',
        'registroSalida.fechaRemision',
        'registroSalida.observacion',
        'registroSalida.descripcion',
        'registroSalida.total',
        'usersolicitante.id',
        'userSolicitante.name',
        'entrega.name',
        'entrega.id',
        'recibeSinSM.name',
        'recibeSinSM.id',
        'numSolicitudCompra.id',
        
        'numSolicitudCompra.numOrden',
        'numOrdenTrabajo.id',
        'numOrdenTrabajo.DescripcionTrabajo',
        'inventario.nombre',
        'inventario.id',
        'itemSalida.id',
        'itemSalida.item',
        'itemSalida.cantidad',
        'itemSalida.caracteristica',
        'itemSalida.Observacion',
      ])
      .where('registroSalida.id = :id', { id: id })
      .getOne();

    if (!registroDeSalida) {
      throw new NotFoundException('No se encontró registro de salida');
    }

    return registroDeSalida;
  }

  async actaDeEntradaByIdCompra(id:number) {
     console.log(id);
     const query = await this.registroEntradaRepository.createQueryBuilder('registroEntrada')
    .leftJoin('registroEntrada.numSolicitudCompra','numSolicitudCompra')
    
    .leftJoin('numSolicitudCompra.numOrdenTrabajo','numOrdenTrabajo')
    .leftJoin('numOrdenTrabajo.userSolicitante','userSolicitante')
    .leftJoin('registroEntrada.recibe','recibe')
    .leftJoin('registroEntrada.proovedor','proovedor')
    .leftJoin('registroEntrada.itemEntrada','itemEntrada')
    .leftJoin('itemEntrada.item','inventario')
    .select([
      'registroEntrada.id',
      'registroEntrada.numActa',
      'registroEntrada.fechaRemision',
      'registroEntrada.factura',
      'registroEntrada.total',
      'userSolicitante.name',
      'recibe.id',
      'recibe.name',
      'proovedor.id',
      'proovedor.nombre',
      'numSolicitudCompra.id',
      'numOrdenTrabajo.id',
      'numOrdenTrabajo.DescripcionTrabajo',
      'inventario.nombre',
      'itemEntrada.cantidad',
      'itemEntrada.costo',
      'itemEntrada.descuento',
      'itemEntrada.iva',
      'itemEntrada.subtotal',
      'itemEntrada.total',
    ]);

if (!isNaN(id)) {
  query.where('registroEntrada.id = :id', { id });
  
} else {
  query.orderBy('registroEntrada.id', 'DESC');
}
   const registroDeEntrada = await query.getOne();

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
 console.log(createProovedorDto);

 if(createProovedorDto.ruc && createProovedorDto.ruc !== ''){
const existe = await this.proovedoresRepository.findOne({
    where: { ruc: createProovedorDto.ruc },
  });

  console.log(existe);
  if (existe) {
    throw new BadRequestException('El RUC ya está registrado');
  }
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
      'inventario.imagen',
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

 async findAllProovedores(){
  return await this.proovedoresRepository.find({select:['id','nombreComercial']});

 }

  async updateActaEntrada(id: number, updateActaEntradaDto: UpdateActaEntradaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      const registroEntrada = await queryRunner.manager.findOne(RegistroEntrada, {
        where: { id: id },
        relations: ['proovedor', 'numSolicitudCompra']
      });

      if (!registroEntrada) {
        throw new NotFoundException('No se encontró el acta de entrada con el ID proporcionado');
      }

      
      if (updateActaEntradaDto.factura !== undefined) {
        registroEntrada.factura = updateActaEntradaDto.factura;
      }

      
      if (updateActaEntradaDto.provedorId !== undefined) {
        const proovedor = await queryRunner.manager.findOne(Proovedores, {
          where: { id: updateActaEntradaDto.provedorId }
        });

        if (!proovedor) {
          throw new NotFoundException('No se encontró el proveedor con el ID proporcionado');
        }

        registroEntrada.proovedor = proovedor;
      }

      
      if (updateActaEntradaDto.solicitudCompraId !== undefined) {
        const solicitudDeCompra = await queryRunner.manager.findOne(SolicitudDeCompra, {
          where: { id: updateActaEntradaDto.solicitudCompraId }
        });

        if (!solicitudDeCompra) {
          throw new NotFoundException('No se encontró la solicitud de compra con el ID proporcionado');
        }

        registroEntrada.numSolicitudCompra = solicitudDeCompra;
      }

      if(updateActaEntradaDto.recibe !== undefined){
         console.log(updateActaEntradaDto.recibe);
        const recibe = await queryRunner.manager.findOne(User, {
          where: { id: updateActaEntradaDto.recibe }
        });

        if (!recibe) {
          throw new NotFoundException('No se encontró el usuario que recibe con el ID proporcionado');
        }

        registroEntrada.recibe = recibe;
      }     
      await queryRunner.manager.save(RegistroEntrada, registroEntrada);

      await queryRunner.commitTransaction();

      return {
        msj: 'Acta de entrada actualizada correctamente',
        validate: true,
        data: registroEntrada
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        msj: 'Error al actualizar el acta de entrada',
        validate: false,
        error: error.message
      };
    } finally {
      await queryRunner.release();
    }
  }

  async updateActaSalida(id: number, updateActaSalidaDto: UpdateActaSalidaDto) {
    console.log(updateActaSalidaDto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
     
      const registroSalida = await queryRunner.manager.findOne(RegistroSalida, {
        where: { id: id },
        relations: ['entrega', 'recibeSinSM', 'numSolicitudCompra', 'numSolicitudCompra.numOrdenTrabajo']
      });

      if (!registroSalida) {
        throw new NotFoundException('No se encontró el acta de salida con el ID proporcionado');
      }

      if(registroSalida.numSolicitudCompra === null || registroSalida.numSolicitudCompra === undefined && updateActaSalidaDto.descripcion !== undefined){
        
        if(registroSalida.descripcion !== updateActaSalidaDto.descripcion){
          registroSalida.descripcion = updateActaSalidaDto.descripcion;
        }   
      }

      
      if (updateActaSalidaDto.entregaId !== undefined) {
        const entrega = await queryRunner.manager.findOne(User, {
          where: { id: updateActaSalidaDto.entregaId }
        });

        if (!entrega) {
          throw new NotFoundException('No se encontró el usuario de entrega con el ID proporcionado');
        }

        registroSalida.entrega = entrega;
      }

      
      if (updateActaSalidaDto.observacion !== undefined) {
        registroSalida.observacion = updateActaSalidaDto.observacion;
      }

        if (updateActaSalidaDto.recibeSinSMId !== undefined) {
          const recibeSinSM = await queryRunner.manager.findOne(User, {
            where: { id: updateActaSalidaDto.recibeSinSMId }
          });

          if (!recibeSinSM) {
            throw new NotFoundException('No se encontró el usuario que recibe con el ID proporcionado');
          }

          registroSalida.recibeSinSM = recibeSinSM;
        }

       

      /*  if (updateActaSalidaDto.solicitanteId !== undefined) {
          const solicitudDeCompra = await queryRunner.manager.findOne(SolicitudDeCompra, {
            where: { id: registroSalida.numSolicitudCompra.id },
            relations: ['numOrdenTrabajo']
          });

          if (!solicitudDeCompra) {
            throw new NotFoundException('No se encontró la solicitud de compra');
          }

          const nuevoSolicitante = await queryRunner.manager.findOne(User, {
            where: { id: updateActaSalidaDto.solicitanteId }
          });

          if (!nuevoSolicitante) {
            throw new NotFoundException('No se encontró el nuevo solicitante con el ID proporcionado');
          }

          if (solicitudDeCompra.numOrdenTrabajo) {
            solicitudDeCompra.numOrdenTrabajo.userSolicitante = nuevoSolicitante;
            await queryRunner.manager.save(solicitudDeCompra.numOrdenTrabajo);
          }
        }*/

      await queryRunner.manager.save(RegistroSalida, registroSalida);

      await queryRunner.commitTransaction();

      return {
        msj: 'Acta de salida actualizada correctamente',
        validate: true,
        data: registroSalida
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        msj: 'Error al actualizar el acta de salida',
        validate: false,
        error: error.message
      };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteActaEntrada(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el acta de entrada
      const registroEntrada = await queryRunner.manager.findOne(RegistroEntrada, {
        where: { id: id },
        relations: ['itemEntrada', 'numSolicitudCompra', 'numSolicitudCompra.estadoCompra']
      });

      if (!registroEntrada) {
        throw new NotFoundException('No se encontró el acta de entrada con el ID proporcionado');
      }

      // Si hay una solicitud de compra asociada, cambiar su estado a "EN PROCESO"
      // EXCEPTO si el estado es "ENTREGADO"
      if (registroEntrada.numSolicitudCompra) {
        const estadoActual = registroEntrada.numSolicitudCompra.estadoCompra?.estado;
        
        // Solo cambiar a EN PROCESO si no está en estado ENTREGADO
        if (estadoActual !== EstadoCompraEnum.ENT && estadoActual !== EstadoCompraEnum.PAU) {
          const estadoEnProceso = await queryRunner.manager.findOne(EstadoCompra, {
            where: { estado: EstadoCompraEnum.PRO }
          });
          
          if (estadoEnProceso) {
            registroEntrada.numSolicitudCompra.estadoCompra = estadoEnProceso;
            await queryRunner.manager.save(SolicitudDeCompra, registroEntrada.numSolicitudCompra);
          }
        }
      }

      // Eliminar todos los items de entrada relacionados
      // (Los items ya tienen onDelete: 'set null', así que se desvinculan automáticamente)
      if (registroEntrada.itemEntrada && registroEntrada.itemEntrada.length > 0) {
        await queryRunner.manager.remove(ItemsEntrada, registroEntrada.itemEntrada);
      }

      // Eliminar el registro de entrada
      await queryRunner.manager.remove(RegistroEntrada, registroEntrada);

      await queryRunner.commitTransaction();

      return {
        msj: 'Acta de entrada eliminada correctamente',
        validate: true
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        msj: 'Error al eliminar el acta de entrada',
        validate: false,
        error: error.message
      };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteActaSalida(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el acta de salida
      const registroSalida = await queryRunner.manager.findOne(RegistroSalida, {
        where: { id: id },
        relations: ['itemSalida', 'numSolicitudCompra', 'numSolicitudCompra.estadoCompra']
      });

      if (!registroSalida) {
        throw new NotFoundException('No se encontró el acta de salida con el ID proporcionado');
      }

      // Si hay una solicitud de compra asociada, cambiar su estado a "EN PROCESO"
      // EXCEPTO si el estado es "ENTREGADO"
      if (registroSalida.numSolicitudCompra) {
        const estadoActual = registroSalida.numSolicitudCompra.estadoCompra?.estado;
        
        // Solo cambiar a EN PROCESO si no está en estado ENTREGADO
        if (estadoActual !== EstadoCompraEnum.ENT && estadoActual !== EstadoCompraEnum.PAU) {
          const estadoEnProceso = await queryRunner.manager.findOne(EstadoCompra, {
            where: { estado: EstadoCompraEnum.PRO }
          });
          
          if (estadoEnProceso) {
            registroSalida.numSolicitudCompra.estadoCompra = estadoEnProceso;
            await queryRunner.manager.save(SolicitudDeCompra, registroSalida.numSolicitudCompra);
          }
        }
      }

      // Eliminar todos los items de salida relacionados
      // (Los items ya tienen onDelete: 'set null', así que se desvinculan automáticamente)
      if (registroSalida.itemSalida && registroSalida.itemSalida.length > 0) {
        await queryRunner.manager.remove(ItemsSalida, registroSalida.itemSalida);
      }

      // Eliminar el registro de salida
      await queryRunner.manager.remove(RegistroSalida, registroSalida);

      await queryRunner.commitTransaction();

      return {
        msj: 'Acta de salida eliminada correctamente',
        validate: true
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        msj: 'Error al eliminar el acta de salida',
        validate: false,
        error: error.message
      };
    } finally {
      await queryRunner.release();
    }
  }

 async update(id: number, updateInventarioDto: UpdateInventarioDto) {
    console.log(updateInventarioDto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventario = await queryRunner.manager.findOne(Inventario,{where:{id:id}});
      if(!inventario){
        throw new NotFoundException("No se encontro el item de inventario");
      }

           if(updateInventarioDto.imagen !== undefined){
        const findMaquina = await queryRunner.manager.findOne(Maquina,{where:{nombre: updateInventarioDto.nombre}});
      if(findMaquina){
        findMaquina.imagen = updateInventarioDto.imagen;
        await queryRunner.manager.save(Maquina,findMaquina);
      }
        inventario.imagen = updateInventarioDto.imagen;
      }

      if(updateInventarioDto.nombre !== undefined){
          const findMaquina = await queryRunner.manager.findOne(Maquina,{where:{nombre: updateInventarioDto.nombre}});
      if(findMaquina){
        findMaquina.nombre = updateInventarioDto.nombre;
        await queryRunner.manager.save(Maquina,findMaquina);
      }
        inventario.nombre = updateInventarioDto.nombre;
      }
      if(updateInventarioDto.costo !== undefined){
        inventario.costo = updateInventarioDto.costo;
      }

      if(updateInventarioDto.stock !== undefined){
        inventario.stock = updateInventarioDto.stock;
      }

      if(updateInventarioDto.stockMin !== undefined){
        inventario.stockMin = updateInventarioDto.stockMin;
      }
      if(updateInventarioDto.bodegaId !== undefined){
        const bodega = await queryRunner.manager.findOne(Bodega,{where:{id:updateInventarioDto.bodegaId}});
        if(!bodega){
          throw new NotFoundException("No se encontro la bodega");
        }
        inventario.bodega = bodega;
      }
      if(updateInventarioDto.seccionId !== undefined){
        const seccion =  await queryRunner.manager.findOne(Seccion,{where:{id:updateInventarioDto.seccionId}});
        if(!seccion){
          throw new NotFoundException("No se encontro la seccion");
        }
        inventario.seccion = seccion;
      }
      if(updateInventarioDto.perchaId !== undefined){
        const percha =  await queryRunner.manager.findOne(Percha,{where:{id:updateInventarioDto.perchaId}});
        if(!percha){
          throw new NotFoundException("No se encontro la percha");
        }
        inventario.percha = percha;
      }
      if(updateInventarioDto.estado !== undefined){
        inventario.estado = updateInventarioDto.estado;
      }

      await queryRunner.manager.save(Inventario, inventario);
      await queryRunner.commitTransaction();
      return {
        msj: "Item de inventario actualizado correctamente",
        validate: true
      };

      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      
    } finally {
      await queryRunner.release();
    }
  
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el inventario
      const inventario = await queryRunner.manager.findOne(Inventario, {
        where: { id: id }
      });

      if (!inventario) {
        throw new NotFoundException(`No se encontró el inventario con ID ${id}`);
      }

      // Eliminar el inventario
      await queryRunner.manager.remove(Inventario, inventario);

      await queryRunner.commitTransaction();

      return {
        msj: 'Inventario eliminado correctamente',
        validate: true
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        msj: 'Error al eliminar el inventario',
        validate: false,
        error: error.message
      };
    } finally {
      await queryRunner.release();
    }
  }
}
