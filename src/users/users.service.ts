import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  @InjectRepository(Role) private readonly rolRepository:Repository<Role>,
){}

 /* async create(createUserDto: CreateUserDto) {
    try {
      console.log("entro");
      const rol = await this.rolRepository.findOne({where:{id:2}});

    const user = await this.userRepository.findOne({where:{email:createUserDto.email}});

    if(user){
    return Error("Correo ya registrado"); 
    }

    if(!rol){
    return new NotFoundException("rol");
    }
    

    const passHashed = await bcrypt.hash(createUserDto.password,10);
     console.log(passHashed);
    createUserDto.password = passHashed;
 
    const createUser = this.userRepository.create(createUserDto);
    createUser.rolId = rol;
    await this.userRepository.save(createUser);
    return {msj:'Usuario creado!'};
    } catch (error) {
      return Error(error);
    }
    
  }*/

  async findAllUsers(){
   
    const users = await this.userRepository.find({select:['id','name','fechaNac','identification','cellphone','email','password','cargoId'],relations:['cargoId']});

    return users;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {

    const users = await this.userRepository.findOne({where:{id:id},select:['id','name','fechaNac','identification','cellphone','email','password','cargoId'],relations:['cargoId']});
    
    return users;
  }



  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

