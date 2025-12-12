import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from '../parametro/entities/area.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { Codigo } from '../parametro/entities/codigo.entity';
import { Maquina } from '../parametro/entities/maquina.entity';
import { CreateAreaDto } from '../admin/dto/create-area.dto';
import { CreateMaquinaDto } from '../admin/dto/create-maquina.dto';
import { AreaDto } from '../admin/dto/area.dto';
import { MaquinaDto } from '../admin/dto/maquina.dto';
import { CreateCategoriaDto } from '../admin/dto/create-categoria.dto';
import { Categoria } from '../parametro/entities/categoria.entity';

import { CreateSolicitudOrdenDto } from './dto/create-solicitud-orden.dto';
import { SolicitudOrden } from './entities/solicitudOrden.entity';
import { CreateTipoTrabajoDto } from '../admin/dto/create-tipo-trabajo.dto';
import { TipoTrabajo } from '../parametro/entities/tipoTrabajo.entity';
import { User } from 'src/users/entities/user.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { FiltrarOrdenDeTrabajoDto } from './dto/filtrar-orden-de-trabajo.dto';
import { EstadoTrabajoEnum } from './enums/estado-trabajo.enum';
import { EstadoTrabajo } from './entities/estadoTrabajo';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SolicitudDeCompra } from 'src/solicitud-de-compra/entities/solicitud-de-compra.entity';
import { EstadoUso } from './entities/estadoUso';

@Injectable()
export class OrdenDeTrabajoService implements OnModuleInit{

  constructor(

    @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository: Repository<SolicitudOrden>,

    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EstadoTrabajo) private readonly estadoTrabajoRepository: Repository<EstadoTrabajo>, 
    @InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository: Repository<SolicitudDeCompra>, 
    @InjectRepository(EstadoUso) private readonly estadoUsoRepository: Repository<EstadoUso>, 
    private dataSource:DataSource,
  ) { }

  async onModuleInit() {
    const estados = [EstadoTrabajoEnum.PROC,EstadoTrabajoEnum.FIN,EstadoTrabajoEnum.VEN,EstadoTrabajoEnum.PEN];

    for(const estado of estados){
      const exist = await this.estadoTrabajoRepository.findOne({where:{estado:estado}});
      if(!exist){
        const newEstado = this.estadoTrabajoRepository.create({estado:estado});
        await this.estadoTrabajoRepository.save(newEstado);
      }
    }

    const estadosUso = await this.estadoUsoRepository.find();
    const bool = [false,true]
    if(estadosUso.length === 0){
       for(const uso of bool){
         const crearUso =  this.estadoUsoRepository.create({uso:uso});
        await this.estadoUsoRepository.save(crearUso);
       }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async ordenTrabajoVencida(){
 //console.log('Verificando ordenes de trabajo vencidas...');
    try {
        const ordenesTrabajo = await this.solicitudOrdenRepository.find({where:{estadoTrabajo:{id:In([1,3,4])}},relations:['estadoTrabajo']});

        if(ordenesTrabajo.length === 0){
         // console.log('No hay ordenes de trabajo en estado procesado');
          return;
        }
        const estadoEnProceso = await this.estadoTrabajoRepository.findOne({where:{id:1}});
        const estadoVencido = await this.estadoTrabajoRepository.findOne({where:{id:3}});
        const estadoPendiente = await this.estadoTrabajoRepository.findOne({where:{id:4}});

         if(!estadoEnProceso){
          console.log('Estado en proceso no encontrado');
       throw new ExceptionsHandler();
        }

        if(!estadoVencido){
          console.log('Estado vencido no encontrado');
       throw new ExceptionsHandler();
        }
        if(!estadoPendiente){
          console.log('Estado pendiente no encontrado');
       throw new ExceptionsHandler();
        }
const fechaActual = new Date();
    for(const orden of ordenesTrabajo){

const existOrdenTrabajo = await this.solicitudOrdenRepository.findOne({where:{id:orden.id}});
      if(existOrdenTrabajo){
       const fechaFinal = new Date(orden.fechaFinal);
       const fechaInicio = new Date(orden.fechaInicio);
      if(fechaActual > fechaFinal){
        orden.estadoTrabajo = estadoVencido;
        await this.solicitudOrdenRepository.save(orden);
            console.log('Verificación de vencidos ejecutada...');

      }
    if(fechaActual <= fechaFinal && fechaActual >= fechaInicio){
     orden.estadoTrabajo = estadoEnProceso;
        await this.solicitudOrdenRepository.save(orden);
    }

    if(fechaActual < fechaInicio){
      orden.estadoTrabajo = estadoPendiente;
      await this.solicitudOrdenRepository.save(orden);
    }
    
    }else{
      return;
    }

    }
    } catch (error) {
      console.log(error);
      throw new ExceptionsHandler(error);
    }
    
  
  }

  /*async registerTipoTrabajo(createTipoTrabajoDto:CreateTipoTrabajoDto){
   
    const categoria = await this.categoriaRepository.findOne({where:{nombre:createTipoTrabajoDto.categoria}});
    if(!categoria){
    return new NotFoundException("No se encontro una categoria");
    }
    
    const newTipoTrabajo = await this.tipoTrabajoRepository.create({tipo:createTipoTrabajoDto.tipo,categoriaId:categoria});
    await this.tipoTrabajoRepository.save(newTipoTrabajo);

    return {msj:"Tipo de trabajo registrado!"}

  }*/

  /*async getAllTipoTrabajoByCategoria(categoria:string){
         
    const allTipoTrabajo = await this.tipoTrabajoRepository.find({where:{categoriaId:{nombre:categoria}},select:['tipo']});
    return allTipoTrabajo;
  }*/

  async registerSolicitudOrden(createSolicitudOrdenDto: CreateSolicitudOrdenDto) {

  const queryRunner = this.dataSource.createQueryRunner();
   await queryRunner.connect();
   await queryRunner.startTransaction();

try {

    console.log(createSolicitudOrdenDto.userTecnico);
    //const solicitante = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userSolicitante }, select: ['id'] });
    /*const receptor = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userReceptor }, select: ['id'] });
    const tecnico = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userTecnico }, select: ['id'] });
    const estado = await this.estadoTrabajoRepository.findOne({where:{id:1}});
    const estadoUso = await this.estadoUsoRepository.findOne({where:{id:1}});*/

    const solicitante = await this.dataSource.createQueryBuilder(User,'user')
    .where('user.name = :name',{name:createSolicitudOrdenDto.userSolicitante})
    .select(['user.id'])
    .getOne();

     if(!solicitante){
     throw new NotFoundException("No se encontro un solicitante");
   }

   const receptor = await queryRunner.manager.createQueryBuilder(User,'user')
    .where('user.name = :name',{name:createSolicitudOrdenDto.userReceptor})
    .select(['user.id'])
    .getOne();

     if(!receptor){
     throw new NotFoundException("No se encontro un receptor");
   }

   const tecnico = await queryRunner.manager.createQueryBuilder(User,'user')
    .where('user.name = :name',{name:createSolicitudOrdenDto.userTecnico})
    .select(['user.id'])
    .getOne();

     if(!tecnico){
     throw new NotFoundException("No se encontro un tecnico");
   }

    const estado = await queryRunner.manager.createQueryBuilder(EstadoTrabajo,'estadoTrabajo')
    .where('estadoTrabajo.id = :id',{id:1})
    
    .getOne();

   if(!estado){
     throw new NotFoundException("No se encontro un estado");
   }

    const estadoUso = await queryRunner.manager.createQueryBuilder(EstadoUso,'estadoUso')
    .where('estadoUso.id = :id',{id:1})
    
    .getOne();

   if(!estadoUso){
     throw new NotFoundException("No se encontro un estado de uso");
   }

    const lgtOrdenTrabajo = await this.solicitudOrdenRepository.count();
    createSolicitudOrdenDto.NumOrden = 'OT-' + (lgtOrdenTrabajo + 1).toString().padStart(5, '0');

    

      const nuevaSolicitud =
      {
        NumOrden: createSolicitudOrdenDto.NumOrden,
        fechaInicio: createSolicitudOrdenDto.fechaInicio,
        fechaFinal: createSolicitudOrdenDto.fechaFinal,
        HoraInicio: createSolicitudOrdenDto.HoraInicio,
        HoraFinal: createSolicitudOrdenDto.HoraFinal,
        Area: createSolicitudOrdenDto.Area,
        Codigo: createSolicitudOrdenDto.Codigo,
        Maquina: createSolicitudOrdenDto.Maquina,
        EspecificacionMaquina: createSolicitudOrdenDto.EspecificacionMaquina,
        Categoria: createSolicitudOrdenDto.Categoria,
        TipoTrabajo: createSolicitudOrdenDto.TipoTrabajo,
        DescripcionTrabajo: createSolicitudOrdenDto.DescripcionTrabajo,
        userSolicitante: solicitante,
        userReceptor: receptor,
        userTecnico: tecnico ?? null,
        estadoTrabajo:estado,
        estadoUso:estadoUso
      };

      const crearSolicitud = await queryRunner.manager.save(SolicitudOrden,nuevaSolicitud);

      




     await queryRunner.commitTransaction();
      return { msj: "Solicitud de orden creada!" };
    /*else{
        const nuevaSolicitud = 
      { 
        fechaInicio:createSolicitudOrdenDto.fechaInicio,
        fechaFinal:createSolicitudOrdenDto.fechaFinal,
        HoraInicio:createSolicitudOrdenDto.HoraInicio,
        HoraFinal:createSolicitudOrdenDto.HoraFinal,     
        Area:createSolicitudOrdenDto.Area,
        Codigo:createSolicitudOrdenDto.Codigo,
        Maquina:createSolicitudOrdenDto.Maquina,
        EspecificacionMaquina:createSolicitudOrdenDto.EspecificacionMaquina,
        Categoria:createSolicitudOrdenDto.Categoria,
        TipoTrabajo:createSolicitudOrdenDto.TipoTrabajo,
        DescripcionTrabajo:createSolicitudOrdenDto.DescripcionTrabajo,
        userSolicitante:solicitante,
        userReceptor:receptor,
       // userTecnico:null
      };
      const crearSolicitud = await this.solicitudOrdenRepository.create(nuevaSolicitud);
    await this.solicitudOrdenRepository.save(crearSolicitud);
    
    return { msj: "Solicitud de orden creada!" };
    }
   */

    //await this.solicitudOrdenRepository.save(nuevaSolicitud);
    
    
  
} catch (error) {
  return { msj: "No se pudo crear la solicitud" };
  await queryRunner.rollbackTransaction();
     }finally{
    await  queryRunner.release();
  
  }}

  async getAllOrdenesTrabajo(){
     
      const ordenes = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .innerJoin('solicitud.userSolicitante', 'userSolicitante')
      .innerJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .innerJoin('solicitud.estadoTrabajo','estado')
      .select([
        'solicitud.id',
        'solicitud.NumOrden',
        'solicitud.fechaInicio',
        'solicitud.fechaFinal',
        'solicitud.HoraInicio',
        'solicitud.HoraFinal',
        'solicitud.Area',
        'solicitud.Categoria',
        'solicitud.TipoTrabajo',
        'solicitud.Codigo',
        'solicitud.Maquina',
        'solicitud.DescripcionTrabajo',
        'userSolicitante.name',
        'userReceptor.name',
        'userTecnico.name',
        'estado.estado'
      ])
     
      .getMany();

    if (ordenes) {
      console.log(ordenes);
      return ordenes;
    }
    return new NotFoundException("No existen solicitudes");
  }

  async allOrdenTrabajoNumOrden(){

    const ordenTrabajosNumOrden = await this.solicitudOrdenRepository.find({select:['NumOrden']});
    if(!ordenTrabajosNumOrden){
return new NotFoundException("No existen ordenes de trabajo");
    }
    return ordenTrabajosNumOrden;
  }

  async getOrdenTrabajoBySolicitante(name:string){
     
      const orden = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .innerJoin('solicitud.userSolicitante', 'userSolicitante')
      .innerJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .innerJoin('solicitud.estadoTrabajo','estado')
      .select([
        'solicitud.id',
        'solicitud.NumOrden',
        'solicitud.fechaInicio',
        'solicitud.fechaFinal',
        'solicitud.HoraInicio',
        'solicitud.HoraFinal',
        'solicitud.Area',
        'solicitud.Categoria',
        'solicitud.TipoTrabajo',
        'solicitud.Codigo',
        'solicitud.Maquina',
        'solicitud.DescripcionTrabajo',
        'userSolicitante.name',
        'userReceptor.name',
        'userTecnico.name',
        'estado.estado'
      ])
     .where(`userSolicitante.name like :name`, { name: `${name}%` })
      .getMany();

    if (orden) {
      console.log(orden);
      return orden;
    }
    return new NotFoundException("No existe solicitud para el usuario");
  }

   async getOrdenTrabajoById(id:number){
     
      const orden = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .innerJoin('solicitud.userSolicitante', 'userSolicitante')
      .innerJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .innerJoin('solicitud.estadoTrabajo','estado')
      .select([
        'solicitud.id',
        'solicitud.NumOrden',
        'solicitud.fechaInicio',
        'solicitud.fechaFinal',
        'solicitud.HoraInicio',
        'solicitud.HoraFinal',
        'solicitud.Area',
        'solicitud.Categoria',
        'solicitud.TipoTrabajo',
        'solicitud.Codigo',
        'solicitud.Maquina',
        'solicitud.EspecificacionMaquina',
        'solicitud.DescripcionTrabajo',
        'userSolicitante.name',
        'userReceptor.name',
        'userTecnico.name',
        'estado.estado'
      ])
     .where(`solicitud.id = :id`, { id: id })
      .getOne();

    if (orden) {
      //console.log(orden);
      return orden;
    }
    return new NotFoundException("No existe solicitud para el usuario");
  }

  async getSolicitudReciente(id:number) {

    console.log(id);
    if(!id){
      id = await this.solicitudOrdenRepository.count();
    }

    const solicitud = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .innerJoin('solicitud.userSolicitante', 'userSolicitante')
      .innerJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .select([
        'solicitud.id',
        'solicitud.NumOrden',
        'solicitud.fechaInicio',
        'solicitud.fechaFinal',
        'solicitud.HoraInicio',
        'solicitud.HoraFinal',
        'solicitud.Area',
        'solicitud.Categoria',
        'solicitud.TipoTrabajo',
        'solicitud.Codigo',
        'solicitud.Maquina',
        'solicitud.DescripcionTrabajo',
        'userSolicitante.name',
        'userReceptor.name',
        'userTecnico.name'
      ])
      .where('solicitud.id = :id', { id })
      .getOne();

    if (solicitud) {
      return solicitud;
    }
    return new NotFoundException("No existen solicitudes");
  }

  async filtrarOrdenDeTrabajo(filtrarOrdenDeTrabajoDto: FiltrarOrdenDeTrabajoDto) {

    if(!filtrarOrdenDeTrabajoDto.userSolicitante && !filtrarOrdenDeTrabajoDto.fechaInicio){
      console.log(filtrarOrdenDeTrabajoDto);
    return []
    }

    if(!filtrarOrdenDeTrabajoDto.fechaInicio){
     const ordenTrabajo = await this.solicitudOrdenRepository.find({ where:{ userSolicitante: { name: Like(`${filtrarOrdenDeTrabajoDto.userSolicitante}%`) } , estadoUso:{id:1}},
    select: ['id','NumOrden','Area','Codigo','Maquina','userSolicitante'],relations:['userSolicitante']});
    console.log(ordenTrabajo);
    return ordenTrabajo;
    }else{
      const ordenTrabajo = await this.solicitudOrdenRepository.find({ where: [{ userSolicitante: { name: Like(`${filtrarOrdenDeTrabajoDto.userSolicitante}%`) }, fechaInicio: filtrarOrdenDeTrabajoDto.fechaInicio }],
    select: ['id','NumOrden','Area','Codigo','Maquina','userSolicitante'],relations:['userSolicitante'] });
    console.log(ordenTrabajo);
    return ordenTrabajo;
    }

  }

  async getAllOrdenesTrabajoSinUso(){

    const ordenesSinUso = await this.solicitudOrdenRepository.find({where:{estadoUso:{id:1}},select:['id','NumOrden','Area','Codigo','Maquina','userSolicitante'],relations:['userSolicitante']});
    return ordenesSinUso;

  }

  async getEstadosTrabajo(){

    const estados = await this.estadoTrabajoRepository.find();

    return estados;
  }
  findOne(id: number) {
    return `This action returns a #${id} ordenDeTrabajo`;
  }

  async update(id: number, updateOrdenDeTrabajoDto: UpdateOrdenDeTrabajoDto) {

    const solicitante = await this.userRepository.findOne({ where: { name: updateOrdenDeTrabajoDto.userSolicitante }, select: ['id'] });
    const receptor = await this.userRepository.findOne({ where: { name: updateOrdenDeTrabajoDto.userReceptor }, select: ['id'] });
    const tecnico = await this.userRepository.findOne({ where: { name: updateOrdenDeTrabajoDto.userTecnico }, select: ['id'] });
    const estado = await this.estadoTrabajoRepository.findOne({where:{estado:updateOrdenDeTrabajoDto.estado},select:['id']});

    if(!solicitante){
      throw new NotFoundException("No se encontro un solicitante");
    }
    if(!receptor){
      throw new NotFoundException("No se encontro un receptor");
    }

     if(!estado){
      throw new NotFoundException("No se encontro un estado");
    }

    
   const updateSoli = await this.solicitudOrdenRepository.update(id,{
    fechaInicio:updateOrdenDeTrabajoDto.fechaInicio,
    fechaFinal:updateOrdenDeTrabajoDto.fechaFinal,
    HoraInicio:updateOrdenDeTrabajoDto.HoraInicio,
    HoraFinal:updateOrdenDeTrabajoDto.HoraFinal,
    Area:updateOrdenDeTrabajoDto.Area,
    Codigo:updateOrdenDeTrabajoDto.Codigo,
    Maquina:updateOrdenDeTrabajoDto.Maquina,
    EspecificacionMaquina:updateOrdenDeTrabajoDto.EspecificacionMaquina,
    Categoria:updateOrdenDeTrabajoDto.Categoria,
    TipoTrabajo:updateOrdenDeTrabajoDto.TipoTrabajo,
    DescripcionTrabajo:updateOrdenDeTrabajoDto.DescripcionTrabajo,
    userSolicitante: solicitante,
    userReceptor: receptor,
    userTecnico: tecnico ?? null,
    estadoTrabajo:estado
   });
   
   if(updateSoli.affected != 0){
    return {msj:"Solicitud de orden actualizada!"};
   }else{
    return {msj:"No se pudo actualizar la solicitud"};
   }  
  }

 async remove(id: number) {

  console.log(id);
  try {
       const deleteOrdenTrabajo = await this.solicitudOrdenRepository.delete({id});

   if(deleteOrdenTrabajo){
   return {msj:"Se elimino correctamente!"}
   }else{
    return {msj:"Fallo al eliminarse"};
   }
  } catch (error) {
    console.log("Error en eliminar orden de trabajo", error);
  }

  }
  }
