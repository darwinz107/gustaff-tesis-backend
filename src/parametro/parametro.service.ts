import { Injectable } from '@nestjs/common';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';

@Injectable()
export class ParametroService {
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
}
