import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from '../parametro/entities/area.entity';
import { Like, Repository } from 'typeorm';
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

@Injectable()
export class OrdenDeTrabajoService {

  constructor(

    @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository: Repository<SolicitudOrden>,

    @InjectRepository(User) private readonly userRepository: Repository<User>,) { }



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
    console.log(createSolicitudOrdenDto.userTecnico);
    const solicitante = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userSolicitante }, select: ['id'] });
    const receptor = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userReceptor }, select: ['id'] });
    const tecnico = await this.userRepository.findOne({ where: { name: createSolicitudOrdenDto.userTecnico }, select: ['id'] });

    if (solicitante && receptor) {

      const nuevaSolicitud =
      {
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
        userTecnico: null
      };

      const crearSolicitud = this.solicitudOrdenRepository.create(nuevaSolicitud);
      await this.solicitudOrdenRepository.save(crearSolicitud);

      return { msj: "Solicitud de orden creada!" };
    }/*else{
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
    return { msj: "No se pudo crear la solicitud" };
  }

  async getSolicitudReciente() {
    const solicitud = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
      .innerJoin('solicitud.userSolicitante', 'userSolicitante')
      .innerJoin('solicitud.userReceptor', 'userReceptor')
      .leftJoin('solicitud.userTecnico', 'userTecnico')
      .select([
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
      .orderBy('solicitud.fechaInicio', 'DESC')
      .getOne();

    if (solicitud) {
      return solicitud;
    }
    return new NotFoundException("No existen solicitudes");
  }

  async filtrarOrdenDeTrabajo(filtrarOrdenDeTrabajoDto: FiltrarOrdenDeTrabajoDto) {

    const ordenTrabajo = await this.solicitudOrdenRepository.find({ where: [{ userSolicitante: { name: Like(`${filtrarOrdenDeTrabajoDto.userSolicitante}%`) }, fechaInicio: filtrarOrdenDeTrabajoDto.fechaInicio }] });
    return ordenTrabajo;

  }

  findOne(id: number) {
    return `This action returns a #${id} ordenDeTrabajo`;
  }

  update(id: number, updateOrdenDeTrabajoDto: UpdateOrdenDeTrabajoDto) {
    return `This action updates a #${id} ordenDeTrabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenDeTrabajo`;
  }
}
