import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { Cargo } from 'src/cargo/entities/cargo.entity';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  @InjectRepository(Role) private readonly rolRepository:Repository<Role>,
  @InjectRepository(Cargo) private readonly cargoRepository:Repository<Cargo>,
){}

  async create(createUserDto: CreateUserDto) {
    try {
      console.log("entro");
      const cargo = await this.cargoRepository.findOne({where:{nombre:createUserDto.cargo}});

    const user = await this.userRepository.findOne({where:{email:createUserDto.email}});

    if(user){
    return Error("Correo ya registrado"); 
    }

    if(!cargo){
    return new NotFoundException("cargp");
    }
    

    const passHashed = await bcrypt.hash(createUserDto.password,10);
     console.log(passHashed);
    createUserDto.password = passHashed;
 
    const createUser = this.userRepository.create(createUserDto);
    createUser.infoCargo = cargo;
    await this.userRepository.save(createUser);
    return {msj:'Usuario creado!'};
    } catch (error) {
      return Error(error);
    }
    
  }

  async findAllUsers(){
   
    const users = await this.userRepository.find({select:['name']});
    return users;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
