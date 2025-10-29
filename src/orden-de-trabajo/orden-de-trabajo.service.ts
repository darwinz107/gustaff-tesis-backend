import { Injectable } from '@nestjs/common';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Repository } from 'typeorm';
import { Codigo } from './entities/codigo.entity';
import { Maquina } from './entities/maquina.entity';

@Injectable()
export class OrdenDeTrabajoService {

  constructor(@InjectRepository(Area) private readonly areaRepository:Repository<Area>,
              @InjectRepository(Codigo) private readonly codigoRepository:Repository<Codigo>,
              @InjectRepository(Maquina) private readonly maquinaRepository:Repository<Maquina>,){}

 async crearArea(area:string) {
    
    const newArea = this.areaRepository.create({nombre:area});
   await this.areaRepository.save(newArea);
   
    return 'This action adds a new crearArea';
  }

  async createMaquina(area:string,maquina:string){
 
    if(!area){
     return {msj:"Asigne una area a la maquina"}
    }

    
  }

  findAll() {
    return `This action returns all ordenDeTrabajo`;
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
