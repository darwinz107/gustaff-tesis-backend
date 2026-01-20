import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from '../parametro/entities/area.entity';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
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
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { SolicitudDeCompra } from 'src/solicitud-de-compra/entities/solicitud-de-compra.entity';
import { EstadoUso } from './entities/estadoUso';
import { FiltrarOrdenDeTrabajoAdvancedDto } from './dto/filtrar-orden-de-trabajo-advanced.dto';
import { Jornada } from './entities/jornadas';
import { Fases } from './entities/fases';
import { addDays, isBefore, isSunday, parseISO } from 'date-fns';
import { MailService } from 'src/mail/mail.service';
import { CronJob } from 'cron';
import { TipoMantenimiento } from '../parametro/entities/tipoMantenimiento.entity';
import { Periodo } from '../parametro/entities/periodo.entity';
import { Query } from 'mysql2/typings/mysql/lib/protocol/sequences/Query';



@Injectable()
export class OrdenDeTrabajoService implements OnModuleInit{

  private isRunning = false;
  constructor(

    @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository: Repository<SolicitudOrden>,

    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EstadoTrabajo) private readonly estadoTrabajoRepository: Repository<EstadoTrabajo>, 
    @InjectRepository(SolicitudDeCompra) private readonly solicitudDeCompraRepository: Repository<SolicitudDeCompra>, 
    @InjectRepository(EstadoUso) private readonly estadoUsoRepository: Repository<EstadoUso>, 
    @InjectRepository(Jornada) private readonly jornadaRepository: Repository<Jornada>,
    @InjectRepository(Fases) private readonly fasesRepository: Repository<Fases>,
    @InjectRepository(TipoMantenimiento) private readonly tipoMantenimientoRepository: Repository<TipoMantenimiento>,
    @InjectRepository(Periodo) private readonly periodoRepository: Repository<Periodo>,
    private dataSource:DataSource,
    private readonly mailService:MailService,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

  async onModuleInit() {

     await this.safeRunSetFases();

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

    // Crear Tipos de Mantenimiento
    const tiposMantenimiento = [
      { inicial: 'MC', mantenimiento: 'MANTENIMIENTO COMPLETO' },
      { inicial: 'MP', mantenimiento: 'MANTENIMIENTO PREVENTIVO' }
    ];

    for (const tipo of tiposMantenimiento) {
      const exist = await this.tipoMantenimientoRepository.findOne({ where: { inicial: tipo.inicial } });
      if (!exist) {
        const newTipo = this.tipoMantenimientoRepository.create(tipo);
        await this.tipoMantenimientoRepository.save(newTipo);
      }
    }

    // Crear Periodos
    const periodos = ['TRIMESTRAL', 'CUATRIMESTRAL', 'SEMESTRAL', 'BIMESTRAL', 'ANUAL'];

    for (const nombrePeriodo of periodos) {
      const exist = await this.periodoRepository.findOne({ where: { nombre: nombrePeriodo } });
      if (!exist) {
        const newPeriodo = this.periodoRepository.create({ nombre: nombrePeriodo });
        await this.periodoRepository.save(newPeriodo);
      }
    }

     const cronExpressions = [
      '0 0 12 * * *',   
      '0 0 15 * * *',   
      '0 30 16 * * *',  
      '0 0 18 * * *'    
    ];

    cronExpressions.forEach((expr, idx) => {
  const name = `setFases_${idx}`;

  if (this.schedulerRegistry.doesExist('cron', name)) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  const job = new CronJob(expr, async () => {
    await this.safeRunSetFases();
  }, null, true, 'America/Bogota');

  this.schedulerRegistry.addCronJob(name, job);
});
  }


   private async safeRunSetFases() {
    if (this.isRunning) {
      console.log('setFasesVencidas ya está corriendo — salto ejecución concurrente');
      return;
    }
    this.isRunning = true;
    try {
      await this.setFasesVencidas();
    } finally {
      this.isRunning = false;
    }
  }

  async setFasesVencidas(){
      console.log(
    'CRON setFasesVencidas ejecutado:',
    new Date().toLocaleString('es-EC', { timeZone: 'America/Bogota' })
  );

   const currentDate  = new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  
const currentDateTime = new Date(
  new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })
);

const jornadas = await this.solicitudOrdenRepository.createQueryBuilder('ordenTrabajo')
  .leftJoinAndSelect('ordenTrabajo.jornadas','jornada')
  .leftJoin('jornada.fases','fases')
  .orderBy('fases.hora', 'ASC')
  .select([
     'ordenTrabajo.id',
  
    'jornada.id',
    'jornada.fecha',
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'fases.agotado',
  ])
  .where('jornada.fecha = :currentDate',{currentDate:currentDate})
.getMany();
const horariosxDia = ['12:00:00','15:00:00','16:30:00','18:00:00'];
let count = 0;
for(const ot of jornadas){
 
  for(const j of ot.jornadas){
     count = 0;

     for(const f of j.fases){

      if (f.completo && f.agotado) {
  console.log(`Saltando fase ${f.id} porque ya está completa`);
   count ++;
  continue;
}
          const horaLimite = horariosxDia[count];

    const fechaHoraLimite = new Date(`${j.fecha}T${horaLimite}`);

        if (currentDateTime.getTime() > fechaHoraLimite.getTime()) {
      
     const upda = await this.fasesRepository.update(f.id,{agotado:true});
    console.log(upda);
    }
    count ++;
     }

  }
}


return jornadas;
 /*  const fases = await this.fasesRepository.createQueryBuilder('fases')
  .innerJoin('fases.jornada','jornada')
 
  .select([
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'jornada.fecha',
    'fases.agotado'
  ])
  
  .where('jornada.fecha = :currentDate',{currentDate:currentDate})
  .getMany();
console.log(fases);  
console.log(fases.length);*/
 /* if(fases.length === 0 || !fases){
    return [];
  }

 const horariosxDia = ['12:00:00','15:00:00','16:30:00','18:00:00'];
     
for (let i = 0; i < fases.length; i++) {
  const fase = fases[i];
  console.log(fase);*/
//console.log(fase.jornada.fecha);
 // if (fase.agotado === true && fase.completo ===true) continue;
  //if(fase.agotado === true) continue;
  /*  const fechaBase = fase.jornada.fecha;

    const horaLimite = horariosxDia[i];

    const fechaHoraLimite = new Date(`${fechaBase}T${horaLimite}`);
    
    if (currentDateTime.getTime() > fechaHoraLimite.getTime()) {
      //console.log(fase.id);
      await this.fasesRepository.update(fase.id,{agotado:true});
    }
}*/
}

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async ordenTrabajoVencida(){
 //console.log('Verificando ordenes de trabajo vencidas...');
    try {
        const ordenesTrabajo = await this.solicitudOrdenRepository.find({where:{estadoTrabajo:{id:In([1,3])}},relations:['estadoTrabajo']});

        if(ordenesTrabajo.length === 0){
         // console.log('No hay ordenes de trabajo en estado procesado');
          return;
        }
        const estadoEnProceso = await this.estadoTrabajoRepository.findOne({where:{id:1}});
        const estadoVencido = await this.estadoTrabajoRepository.findOne({where:{id:3}});
       // const estadoPendiente = await this.estadoTrabajoRepository.findOne({where:{id:4}});

           if (!estadoEnProceso || !estadoVencido /*|| !estadoPendiente*/) {
      console.error('Faltan estados en DB');
      return;
    }
      const fechaActual = new Date();
     
    for(const orden of ordenesTrabajo){

        if (!orden.fechaFinal || !orden.fechaInicio || !orden.HoraFinal || !orden.HoraInicio) {
          console.warn(`Orden ${orden.id} con datos incompletos, se salta`);
          continue;
        }

      const [hh,mm,ss] = orden.HoraFinal.split(":").map(Number);
      const [y,m,d] = orden.fechaFinal.toString().split("-").map(Number);
      //console.log("fechaftostring:",orden.fechaFinal.toString());
      const fechaFinal = new Date(y,m-1,d,hh,mm,ss);

      const [hh2,mm2,ss2] = orden.HoraInicio.split(":").map(Number);
      const [y2,m2,d2] = orden.fechaInicio.toString().split("-").map(Number);

      const fechaInicio = new Date(y2,m2-1,d2,hh2,mm2,ss2);
      /*const hfString = orden.HoraFinal.toTimeString();
      console.log(hfString);*/

const existOrdenTrabajo = await this.solicitudOrdenRepository.findOne({where:{id:orden.id}});
    if (existOrdenTrabajo) {
  if (fechaFinal.getTime() < fechaActual.getTime()) {
   /*console.log("fechaActual",fechaActual);
   console.log("fechaFinal",fechaFinal);*/
    
    orden.estadoTrabajo = estadoVencido;
     console.log('Verificación de vencidos ejecutada...');
  } else /*if (fechaActual.getTime() <= fechaFinal.getTime() && fechaActual.getTime() >= fechaInicio.getTime())*/ {
    orden.estadoTrabajo = estadoEnProceso;
     console.log('Verificación de en procesos ejecutada...');
  } /*else if (fechaActual.getTime() < fechaInicio.getTime()) {
    orden.estadoTrabajo = estadoPendiente;
  }*/
  await this.solicitudOrdenRepository.save(orden);
 
} else {
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
  console.log(createSolicitudOrdenDto);
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

    const solicitante = await queryRunner.manager.createQueryBuilder(User,'user')
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

    const lgtOrdenTrabajo = await queryRunner.manager.find(SolicitudOrden,{order:{id:"DESC"},take:1,select:['id']});
      if(!lgtOrdenTrabajo){
        console.log("No se pudo crear el numOrden");
     throw new NotFoundException("No se pudo crear el numOrden");
   }
   const lgtFinal = lgtOrdenTrabajo.length > 0 ? lgtOrdenTrabajo[0].id:0;
    createSolicitudOrdenDto.NumOrden = 'OT-' + (lgtFinal + 1).toString().padStart(5, '0');

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

     const solicitudCreated = await queryRunner.manager.save(SolicitudOrden,nuevaSolicitud);

      await this.crearJornadasyFases(createSolicitudOrdenDto.fechaInicio,createSolicitudOrdenDto.fechaFinal,createSolicitudOrdenDto.HoraInicio,createSolicitudOrdenDto.HoraFinal,solicitudCreated.id,queryRunner);
    
     await queryRunner.commitTransaction();
     await this.mailService.newOrdenTrabajoNoti(solicitudCreated.NumOrden,solicitudCreated.fechaInicio,solicitudCreated.fechaFinal);
      return { msj: "Solicitud de orden creada!",validate:true };
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
  await queryRunner.rollbackTransaction();
  console.log(error);
  return { msj: `No se pudo crear la solicitud: ${error}`,validate:false };
     }finally{
    await  queryRunner.release();
  }}

 private async crearJornadasyFases(fechaInicio:string,fechaFinal:string,HoraInicio:string,HoraFinal:string,ordenTrabajoId:number, queryRunner:QueryRunner){
        const horariosxDia = ['09:30:00','12:00:00','15:00:00','16:30:00'];
     
  let fechaI = parseISO(fechaInicio);
  let fechaf = parseISO(fechaFinal);

   const toDateTime = (hora:string) => parseISO(`1970-01-01T${hora}`)

   const horaI = toDateTime(HoraInicio);
   const horaF = toDateTime(HoraFinal);
  // const horasDate = horariosxDia.map(hora => toDateTime(hora));
const ordenTrabajo = await queryRunner.manager.findOne(SolicitudOrden,{where:{id:ordenTrabajoId}});
  if(!ordenTrabajo){
    throw new NotFoundException("No se encontro la orden de trabajo para crear jornadas y fases");
  }
     while(isBefore(fechaI, addDays(fechaf,1))) {
    if(isSunday(fechaI) === false){
       const newJornada = await queryRunner.manager.save(Jornada,{ fecha:fechaI, OrdenDeTrabajoId:ordenTrabajo});
      
      for(const hora of horariosxDia){
        const horaActual = toDateTime(hora);
        if(horaI > horaActual) continue;
        if(horaF < horaActual) break;   
         await queryRunner.manager.save(Fases,{ hora:hora, jornada:newJornada });
         
      }
     }
      fechaI = addDays(fechaI,1);
    }
  }

  async getAllOrdenesTrabajo(){
     
      const ordenes = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .leftJoin('solicitud.userSolicitante', 'userSolicitante')
      .leftJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .leftJoin('solicitud.estadoTrabajo','estado')
      .leftJoin('solicitud.estadoUso','estadoUso')
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
        'estado.estado',
        "estadoUso.uso"
      ])
     
      .getMany();

    if (ordenes !==undefined) {
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
      .leftJoin('solicitud.userSolicitante', 'userSolicitante')
      .leftJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .leftJoin('solicitud.estadoTrabajo','estado')
      .leftJoin('solicitud.estadoUso','estadoUso')
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
        'estado.estado',
         "estadoUso.uso"
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
      .leftJoin('solicitud.userSolicitante', 'userSolicitante')
      .leftJoin('solicitud.userReceptor', 'userReceptor')
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
        'estado.id',
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
      const lastOrdTrabajo = await this.solicitudOrdenRepository.find({order:{id:"DESC"},take:1,select:["id"]});
      if(lastOrdTrabajo.length === 0){
       id = 1
      }else{
        id = lastOrdTrabajo[0].id;
      }
    }

    const solicitud = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .leftJoin('solicitud.userSolicitante', 'userSolicitante')
      .leftJoin('solicitud.userReceptor', 'userReceptor')
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
      const ordenTrabajo = await this.solicitudOrdenRepository.find({ where: [{ userSolicitante: { name: Like(`${filtrarOrdenDeTrabajoDto.userSolicitante}%`) }, fechaInicio: filtrarOrdenDeTrabajoDto.fechaInicio.toDateString().split('T')[0]},],
    select: ['id','NumOrden','Area','Codigo','Maquina','userSolicitante'],relations:['userSolicitante'] });
    console.log(ordenTrabajo);
    return ordenTrabajo;
    }

  }

  async getAllOrdenesTrabajoSinUso(){

    const ordenesSinUso = await this.solicitudOrdenRepository.find({where:{estadoUso:{id:1}},select:['id','NumOrden','Area','Codigo','Maquina','userSolicitante','DescripcionTrabajo'],relations:['userSolicitante']});
    return ordenesSinUso;

  }

  async filtrarOrdenesSinUso(filtrarOrdenDeTrabajoDto: FiltrarOrdenDeTrabajoDto){

    console.log(filtrarOrdenDeTrabajoDto);
   const qb = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
   .leftJoin('solicitud.userSolicitante','userSolicitante')
   .leftJoin('solicitud.estadoUso','estadoUso')
   .where('estadoUso.id = :estadoUsoId',{estadoUsoId:1});

    if(filtrarOrdenDeTrabajoDto.numOrden){
      qb.andWhere('solicitud.NumOrden LIKE :numOrden',{numOrden:`${filtrarOrdenDeTrabajoDto.numOrden}%`});
    }
    if(filtrarOrdenDeTrabajoDto.userSolicitante){
      qb.andWhere('userSolicitante.name LIKE :name',{name:`${filtrarOrdenDeTrabajoDto.userSolicitante}%`});
    }

    if(filtrarOrdenDeTrabajoDto.Area){
    qb.andWhere('solicitud.Area LIKE :area',{area:`${filtrarOrdenDeTrabajoDto.Area}%`});
    }

    qb.select([
      'solicitud.id',
      'solicitud.NumOrden',
      'solicitud.Area',
      'solicitud.Codigo',
      'solicitud.Maquina',
      'solicitud.DescripcionTrabajo',
      'userSolicitante.name'
    ]);
    
    const ordenes = await qb.getMany();
    
    return ordenes;

  }

  async getEstadosTrabajo(){

    const estados = await this.estadoTrabajoRepository.find();

    return estados;
  }
  findOne(id: number) {
    return `This action returns a #${id} ordenDeTrabajo`;
  }

  async update(id: number, updateOrdenDeTrabajoDto: UpdateOrdenDeTrabajoDto) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let solicitante:User|null = null;
    let receptor:User|null = null;
    let tecnico:User|null = null;
    let estado:EstadoTrabajo|null = null;
    try {
      if(updateOrdenDeTrabajoDto.userSolicitante){
         solicitante = await queryRunner.manager.findOne(User,{where:{name:updateOrdenDeTrabajoDto.userSolicitante},select:['id']});
      }

      if(updateOrdenDeTrabajoDto.userReceptor){
        receptor = await queryRunner.manager.findOne(User,{where:{name:updateOrdenDeTrabajoDto.userReceptor},select:['id']});
      }

      if(updateOrdenDeTrabajoDto.userTecnico){
        tecnico = await queryRunner.manager.findOne(User,{where:{name:updateOrdenDeTrabajoDto.userTecnico},select:['id']});
      }
  
      if(updateOrdenDeTrabajoDto.estado){
        estado = await queryRunner.manager.findOne(EstadoTrabajo,{where:{estado:updateOrdenDeTrabajoDto.estado},select:['id']});
      }

      const ordenTrabajoExist = await queryRunner.manager.findOne(SolicitudOrden,{where:{id}});
      if(!ordenTrabajoExist){
        throw new NotFoundException("No se encontro la orden de trabajo a actualizar");
      }

    if(updateOrdenDeTrabajoDto.fechaInicio || updateOrdenDeTrabajoDto.fechaFinal && updateOrdenDeTrabajoDto.HoraInicio || updateOrdenDeTrabajoDto.HoraFinal){
     const jornadasExist = await queryRunner.manager.find(Jornada,{where:{OrdenDeTrabajoId:{id}}});
     const fasesExist = await queryRunner.manager.createQueryBuilder(Fases,'fases')
      .innerJoin('fases.jornada','jornada')
      .where('jornada.OrdenDeTrabajoId = :id',{id})
      .getMany();
    
      if(fasesExist.length > 0) await queryRunner.manager.delete(Fases,fasesExist.map(fase => fase.id));

   if(jornadasExist.length > 0) await queryRunner.manager.delete(Jornada,jornadasExist.map(jornada => jornada.id));

    await this.crearJornadasyFases(updateOrdenDeTrabajoDto.fechaInicio ?? ordenTrabajoExist.fechaInicio ,updateOrdenDeTrabajoDto.fechaFinal ?? ordenTrabajoExist.fechaFinal,updateOrdenDeTrabajoDto.HoraInicio ?? ordenTrabajoExist.HoraInicio,updateOrdenDeTrabajoDto.HoraFinal ?? ordenTrabajoExist.HoraFinal,id,queryRunner);

   
    }


    await queryRunner.manager.update(SolicitudOrden,id,{
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
    estadoTrabajo: estado ?? ordenTrabajoExist.estadoTrabajo
   });
   await queryRunner.commitTransaction();
   await this.ordenTrabajoVencida();
   return {msj:"Solicitud de orden actualizada!",validate:true  };
    
  }
   catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(error);
    return { msj: `No se pudo actualizar la solicitud: ${error}`,validate:false };
       }finally{
       queryRunner.release();
      }  
  }

 async remove(id: number) {

  
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
  try {
       const ordenTrabajo = await queryRunner.manager.findOne(SolicitudOrden,{where:{id}});

       if (!ordenTrabajo) {
        throw new NotFoundException(`No se encontró la orden de trabajo con ID ${id}`);
      }

    const fases = await queryRunner.manager.find(Fases,{where:{jornada:{OrdenDeTrabajoId:{id}}}});

    await queryRunner.manager.delete(Fases,fases.map(fase => fase.id));

    const deleteJornadas = await queryRunner.manager.delete(Jornada,{OrdenDeTrabajoId:id});

    const deleteOrdenTrabajo = await queryRunner.manager.delete(SolicitudOrden,{id});

    await queryRunner.commitTransaction();
    return { msj: "Orden de trabajo eliminada!",validate:true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(error);
    return { msj: `No se pudo eliminar la orden de trabajo: ${error}`,validate:false };
  }finally{
    await  queryRunner.release();
  }

  }

  async filtrarOrdenesAvanzado(filtros: FiltrarOrdenDeTrabajoAdvancedDto) {
  const qb = this.solicitudOrdenRepository.createQueryBuilder('solicitud')
    .leftJoin('solicitud.userSolicitante', 'userSolicitante')
    .leftJoin('solicitud.userReceptor', 'userReceptor')
    .leftJoin('solicitud.userTecnico', 'userTecnico')
    .leftJoin('solicitud.estadoTrabajo', 'estado')
    .leftJoin('solicitud.estadoUso', 'estadoUso')
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
      'estado.estado',
      'estadoUso.uso'
    ]);

  if (filtros.numOrden) {
    qb.andWhere('solicitud.NumOrden LIKE :numOrden', { numOrden: `%${filtros.numOrden}%` });
  }
  if (filtros.fechaFinal) {
    qb.andWhere('solicitud.fechaFinal = :fechaFinal', { fechaFinal: filtros.fechaFinal });
  }
  if (filtros.solicitante) {
    qb.andWhere('userSolicitante.name LIKE :solicitante', { solicitante: `${filtros.solicitante}%` });
  }
  if (filtros.descripcion) {
    qb.andWhere('solicitud.DescripcionTrabajo LIKE :descripcion', { descripcion: `%${filtros.descripcion}%` });
  }
  if (filtros.estado) {
    qb.andWhere('estado.estado = :estado', { estado: filtros.estado });
  }
  if (filtros.area) {
    qb.andWhere('solicitud.Area = :area', { area: filtros.area });
  }
  if (filtros.codigo) {
    qb.andWhere('solicitud.Codigo = :codigo', { codigo: filtros.codigo });
  }
  if (filtros.maquina) {
    qb.andWhere('solicitud.Maquina = :maquina', { maquina: filtros.maquina });
  }
  if (filtros.categoria) {
    qb.andWhere('solicitud.Categoria = :categoria', { categoria: filtros.categoria });
  }
  if (filtros.tipoTrabajo) {
    qb.andWhere('solicitud.TipoTrabajo = :tipoTrabajo', { tipoTrabajo: filtros.tipoTrabajo });
  }

  const ordenes = await qb.getMany();
  return ordenes;
}

async getfasesByOrdenTrabajo(id:number){

  const currentDate  = new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});

  const fases = await this.fasesRepository.createQueryBuilder('fases')
  .innerJoin('fases.jornada','jornada')
  .innerJoin('jornada.OrdenDeTrabajoId','ordenDeTrabajo')
  .select([
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'jornada.fecha',
    'fases.agotado'
  ])
  .where('ordenDeTrabajo.id = :id',{id})
  .andWhere('jornada.fecha = :currentDate',{currentDate:currentDate})
  .getMany();

  if(fases.length === 0 || !fases){
    return [];
  }

 
  return fases;
}




async getPromedioFasesCompletadas(id:number){

  const totalFases = await this.fasesRepository.createQueryBuilder('fases')
  .innerJoin('fases.jornada','jornada')
  .innerJoin('jornada.OrdenDeTrabajoId','ordenDeTrabajo')
  .where('ordenDeTrabajo.id = :id',{id})
  .getCount();

  const fasesCompletadas = await this.fasesRepository.createQueryBuilder('fases')
  .innerJoin('fases.jornada','jornada')
  .innerJoin('jornada.OrdenDeTrabajoId','ordenDeTrabajo')
  .where('ordenDeTrabajo.id = :id',{id})
  .andWhere('fases.completo = :completo',{completo:true})
  .getCount();

  if(totalFases === 0){
    return 0;
  }
  const promedio = (fasesCompletadas / totalFases) * 100;
  if(promedio === 100){
   const ordenTrabajo = await this.solicitudOrdenRepository.findOne({where:{id},relations:['estadoTrabajo']});
   if(!ordenTrabajo){
     throw new NotFoundException();
   }
   if(ordenTrabajo.estadoTrabajo.estado === EstadoTrabajoEnum.PROC){
      const estadoFin = await this.estadoTrabajoRepository.findOne({where:{estado:EstadoTrabajoEnum.FIN}});
      if(!estadoFin){
       throw new NotFoundException();
      }
      ordenTrabajo.estadoTrabajo = estadoFin;
      console.log("finalizando", ordenTrabajo.NumOrden);
      await this.solicitudOrdenRepository.save(ordenTrabajo);
await this.mailService.sendEstadoOrdenTrabjoNotification(ordenTrabajo.NumOrden,ordenTrabajo.estadoTrabajo.estado,"Se notifica que el trabajo para la orden mencionada a sido completada con exito.");
   }

   return 100;
  }
  

  return Math.round(promedio);
}

async faseCompleted(id:number, descripcion:string){
console.log(id,descripcion);
  const fase = await this.fasesRepository.findOne({where:{id},relations:['jornada','jornada.OrdenDeTrabajoId']});
  if(!fase){
    throw new NotFoundException("No se encontro la fase");
  }
  fase.completo = true;
  fase.descripcion = descripcion;
 //fase.agotado = true;
  await this.fasesRepository.save(fase);
  return {msj:"Fase marcada como completada"};
   
}

async getAllJornadas(){
 
 /* const jornadas = await this.jornadaRepository.createQueryBuilder('jornada')
  .leftJoin('jornada.OrdenDeTrabajoId','ordenTrabajo')
  .leftJoin('jornada.fases','fases')
  .select([
    'ordenTrabajo.id',
    'ordenTrabajo.NumOrden',
    'jornada.id',
    'jornada.fecha',
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'fases.agotado',
  ])
  .getMany();*/

  const jornadas = await this.solicitudOrdenRepository.createQueryBuilder('ordenTrabajo')
  .leftJoinAndSelect('ordenTrabajo.jornadas','jornada')
  .leftJoin('jornada.fases','fases')
  .select([
     'ordenTrabajo.id',
    'ordenTrabajo.NumOrden',
    'jornada.id',
    'jornada.fecha',
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'fases.agotado',
  ])
.getMany();
  return jornadas;

}

async filtrarJornadas(filtros:FiltrarOrdenDeTrabajoAdvancedDto){
 
  console.log(filtros);
  const qb = await this.solicitudOrdenRepository.createQueryBuilder('ordenTrabajo')
  .leftJoinAndSelect('ordenTrabajo.jornadas','jornada')
   .innerJoin('ordenTrabajo.estadoTrabajo', 'estado')
  .leftJoin('jornada.fases','fases')
  .select([
     'ordenTrabajo.id',
    'ordenTrabajo.NumOrden',
    'jornada.id',
    'jornada.fecha',
    'fases.id',
    'fases.hora',
    'fases.completo',
    'fases.descripcion',
    'fases.agotado',
  ]);

 
 if (filtros.numOrden) {
    qb.andWhere('ordenTrabajo.NumOrden LIKE :numOrden', { numOrden: `%${filtros.numOrden}` });
  }
  if (filtros.fechaInicio) {
    qb.andWhere('ordenTrabajo.fechaInicio = :fechaInicio', { fechaInicio: filtros.fechaInicio });
  }
 
  if (filtros.estado) {
    qb.andWhere('estado.estado = :estado', { estado: filtros.estado });
  }

  const ordenes = await qb.getMany();
  return ordenes;

}

}
