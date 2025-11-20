import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Repository } from 'typeorm';
import { Codigo } from './entities/codigo.entity';
import { Maquina } from './entities/maquina.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { AreaDto } from './dto/area.dto';
import { MaquinaDto } from './dto/maquina.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Categoria } from './entities/categoria.entity';

import { CreateSolicitudOrdenDto } from './dto/create-solicitud-orden.dto';
import { SolicitudOrden } from './entities/solicitudOrden.entity';
import { CreateTipoTrabajoDto } from './dto/create-tipo-trabajo.dto';
import { TipoTrabajo } from './entities/tipoTrabajo.entity';
import { User } from 'src/users/entities/user.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class OrdenDeTrabajoService {

  constructor(@InjectRepository(Area) private readonly areaRepository: Repository<Area>,
    @InjectRepository(Codigo) private readonly codigoRepository: Repository<Codigo>,
    @InjectRepository(Maquina) private readonly maquinaRepository: Repository<Maquina>,
    @InjectRepository(Categoria) private readonly categoriaRepository: Repository<Categoria>,

    @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository: Repository<SolicitudOrden>,
    @InjectRepository(TipoTrabajo) private readonly tipoTrabajoRepository: Repository<TipoTrabajo>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,) { }

  async crearArea(createAreaDto: CreateAreaDto) {

   

    if (!createAreaDto.area) {
      return { msj: "No se permite valores vacios" };
    }

    const newArea = this.areaRepository.create({ nombre: createAreaDto.area});
    await this.areaRepository.save(newArea);

    return { msj: 'This action adds a new crearArea' };
  }

  async createMaquina(createMaquinaDto: CreateMaquinaDto) {

    if (!createMaquinaDto.area) {
      return { msj: "Asigne una area a la maquina" };
    }

    if (!createMaquinaDto.maquina) {
      return { msj: "Ingrese una maquina" };
    }

    const searchArea = await this.areaRepository.findOne({
      where: {
        nombre: createMaquinaDto.area
      }
    });

    if (!searchArea) {
      return { msj: "No existe esa area, digite una existente" }
    }

    const maquinas = await this.maquinaRepository.find();


    const newCod = `GUFF-${createMaquinaDto.maquina.slice(0,2)}-${maquinas.length + 1}`;

    const nuevoCodigo = await this.codigoRepository.create({ cod: newCod, area: { id: searchArea.id } });
    await this.codigoRepository.save(nuevoCodigo);

    const nuevaMaquina = await this.maquinaRepository.create({ nombre: createMaquinaDto.maquina, codigo: { id: nuevoCodigo.id } });
    await this.maquinaRepository.save(nuevaMaquina);

    return { msj: "Maquina creada!" }
  }

  async findAll() {

    const areas = await this.areaRepository.find({ select: ['nombre'] });
    return areas;
  }

  async findAllCodbyArea(areaDto: AreaDto) {

    const areaid = await this.areaRepository.findOne({ where: { nombre: areaDto.area } });

    if (!areaid) {
      return { msj: "No existe esa area" }
    }

    const searchCodigos = await this.codigoRepository.find({
      where: {
        area: { id: areaid.id }
      },
      select: ['cod']
    });

    return searchCodigos;

  }

  async findAllMaquinasByCod(maquinaDto: MaquinaDto) {

    const codid = await this.codigoRepository.findOne({ where: { cod: maquinaDto.codigo } });
    if (!codid) {
      return { msj: "No existe ese codigo" }
    }

    console.log(maquinaDto.codigo, codid);

    const searchMaquinas = await this.maquinaRepository.find({
      where: {
        codigo: { id: codid.id }
      }, select: ['nombre']
    });


    return searchMaquinas;
  }

  async createCategoria(createCategoriaDto: CreateCategoriaDto) {

    const newCategoria = await this.categoriaRepository.create(createCategoriaDto);
    await this.categoriaRepository.save(newCategoria);
    return { msj: "Categoria creada!" }
  }

  async findAllCategorias() {
    const categorias = await this.categoriaRepository.find({ select: ['nombre'] });
    return categorias;
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
    console.log(createSolicitudOrdenDto.userTecnico);
    const solicitante = await this.userRepository.findOne({where:{name:createSolicitudOrdenDto.userSolicitante},select:['id']});
    const receptor = await this.userRepository.findOne({where:{name:createSolicitudOrdenDto.userReceptor},select:['id']});
    const tecnico = await this.userRepository.findOne({where:{name:createSolicitudOrdenDto.userTecnico},select:['id']});

    if(solicitante && receptor){

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
        userTecnico:null
      };
     
    const crearSolicitud =  this.solicitudOrdenRepository.create(nuevaSolicitud);
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
  return {msj:"No se pudo crear la solicitud"};
  }

  async getSolicitudReciente(){
    const solicitud = await this.solicitudOrdenRepository.createQueryBuilder('solicitud')
    .innerJoin('solicitud.userSolicitante','userSolicitante')
    .innerJoin('solicitud.userReceptor','userReceptor')
    .leftJoin('solicitud.userTecnico','userTecnico')
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
    .orderBy('solicitud.fechaInicio','DESC')
    .getOne();
    
    if(solicitud){
    return solicitud;
    }
    return new NotFoundException("No existen solicitudes");
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
