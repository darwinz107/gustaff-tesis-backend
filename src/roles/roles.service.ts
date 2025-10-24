import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService implements OnModuleInit{

  constructor(@InjectRepository(Role) private readonly roleRepository:Repository<Role>,){

  };

  async onModuleInit() {
    const rolesDefault = ["admin","user"];

    for(const rol of rolesDefault) {
      const exits = await this.roleRepository.findOne({where:{role:rol}});

      if(!exits){
        const createRol = await this.roleRepository.create({role:rol});

       await this.roleRepository.save(createRol);
      }
    };
  }

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
