import { Injectable } from '@nestjs/common';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoMantenimiento } from './entities/tipoMantenimiento.entity';
import { Periodo } from './entities/periodo.entity';

@Injectable()
export class ParametroService {
  constructor(
    @InjectRepository(TipoMantenimiento) private readonly tipoMantenimientoRepository: Repository<TipoMantenimiento>,
    @InjectRepository(Periodo) private readonly periodoRepository: Repository<Periodo>,
  ) {}

  create(createParametroDto: CreateParametroDto) {
    return 'This action adds a new parametro';
  }

  findAll() {
    return `This action returns all parametro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parametro`;
  }

  update(id: number, updateParametroDto: UpdateParametroDto) {
    return `This action updates a #${id} parametro`;
  }

  remove(id: number) {
    return `This action removes a #${id} parametro`;
  }

  async getTiposMantenimiento() {
    return this.tipoMantenimientoRepository.find();
  }

  async getPeriodos() {
    return this.periodoRepository.find();
  }
}
