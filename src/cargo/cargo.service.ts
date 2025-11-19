import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class CargoService {
  constructor(@InjectRepository(Cargo) private readonly cargoRepository:Repository<Cargo>,
              @InjectRepository(Role) private readonly roleRepository:Repository<Role>,
){}
  create(createCargoDto: CreateCargoDto) {

    const rol = await this.roleRepository.findOne({where:{id:createCargoDto.rolId}});

    if(!rol){
     return throw new NotFoundException("No se encontro el rol");
    }

    const newCargo = this.cargoRepository.create({nombre:createCargoDto.cargo,rol:rol});
    await this.cargoRepository.save(newCargo);
    return 'Nuevo cargo registrado';
  }

  findAll() {
    return `This action returns all cargo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cargo`;
  }

  update(id: number, updateCargoDto: UpdateCargoDto) {
    return `This action updates a #${id} cargo`;
  }

  remove(id: number) {
    return `This action removes a #${id} cargo`;
  }
}
