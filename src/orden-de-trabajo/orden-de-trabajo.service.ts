import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OrdenDeTrabajoService {

  constructor(@InjectRepository(Area) private readonly areaRepository:Repository<Area>,
              @InjectRepository(Codigo) private readonly codigoRepository:Repository<Codigo>,
              @InjectRepository(Maquina) private readonly maquinaRepository:Repository<Maquina>,){}

 async crearArea(createAreaDto:CreateAreaDto) {

  
  
  if(!createAreaDto.area || !createAreaDto.cod){
   return {msj:"No se permite valores vacios"};
  }

    const newArea = this.areaRepository.create({nombre:createAreaDto.area,cod:createAreaDto.cod});
   await this.areaRepository.save(newArea);
   
    return {msj:'This action adds a new crearArea'};
  }

  async createMaquina(createMaquinaDto:CreateMaquinaDto) {
 
    if(!createMaquinaDto.area){
     return {msj:"Asigne una area a la maquina"};
    }

    if(!createMaquinaDto.maquina){
     return {msj:"Ingrese una maquina"};
    }

    const searchArea = await this.areaRepository.findOne({where:{
      nombre:createMaquinaDto.area
    }});

    if(!searchArea){
      return {msj:"No existe esa area, digite una existente"}
    }

    const searchCodigo = await this.codigoRepository.find({where:{
     area:{id:searchArea.id}
    }});

    const newCod = searchArea.cod +`-${searchCodigo.length +1}`;

    const nuevoCodigo = await this.codigoRepository.create({cod:newCod,area:{id:searchArea.id}});
    await this.codigoRepository.save(nuevoCodigo);

    const nuevaMaquina = await this.maquinaRepository.create({nombre:createMaquinaDto.maquina,codigo:{id:nuevoCodigo.id}});
    await this.maquinaRepository.save(nuevaMaquina);

    return {msj:"Maquina creada!"}
  }

  async findAll() {

    const areas = await this.areaRepository.find({select:['nombre']});
    return areas;
  }

  async findAllCodbyArea(areaDto:AreaDto) {
    
    const areaid = await this.areaRepository.findOne({where:{nombre:areaDto.area}});
    
    if(!areaid){
      return {msj:"No existe esa area"}
    }

   const searchCodigos = await this.codigoRepository.find({
    where:{
      area:{id:areaid.id}
    },
    select:['cod']
   });
   
    return searchCodigos;
    
  }

  async findAllMaquinasByCod(maquinaDto:MaquinaDto) {
   
    const codid = await this.codigoRepository.findOne({where:{cod:maquinaDto.codigo}});
    if(!codid){
      return {msj:"No existe ese codigo"}
    }

    console.log(maquinaDto.codigo,codid);

    const searchMaquinas = await this.maquinaRepository.find({
      where:{
        codigo:{id:codid.id}
  },select:['nombre']});

  
    return searchMaquinas;
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
