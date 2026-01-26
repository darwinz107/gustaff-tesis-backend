import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { FiltrarUserDto } from './dto/filtrar-user.dto';


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

  async findUsersBySupervisorRoles() {
  const rolesPermitidos = [
    'SUPERVISOR MANTENIMIENTO',
    'SUPERVISOR PLANIFICACION DE PROYECTOS',
    'SUPERVISOR GALLETERIA',
    'SUPERVISOR SEGURIDAD INDUSTRIAL',
    'SUPERVISOR CONTROL DE CALIDAD',
    'COORDINDACION DE OPERACIONES',
    'SUPERVISOR CHOCOLATERIA',
    'GERENCIA',
    'SUPERVISOR LOGISTICA INTERNA',
    'SUPERVISOR PLANTA',
    'COORDINADOR DE MANTENIMIENTO'
  ];

  const users = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.cargoId', 'cargo')
    .leftJoinAndSelect('cargo.rolId', 'rol')
    .where('rol.role IN (:...roles)', { roles: rolesPermitidos })
    .select([
      'user.id',
      'user.name',
    ])
    .getMany();

  return users;
}
  
async findUsersGerenciaYCoordinacion() {
  const rolesPermitidos = [
    'GERENCIA',
    'COORDINADOR DE MANTENIMIENTO',
    'SUPERVISOR LOGISTICA INTERNA'
  ];

  const users = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.cargoId', 'cargo')
    .leftJoinAndSelect('cargo.rolId', 'rol')
    .where('rol.role IN (:...roles)', { roles: rolesPermitidos })
    .select([
      'user.id',
      'user.name',
     
    ])
    .getMany();

  return users;
}


  async findAllUsers(){
   
    const users = await this.userRepository.find({select:['id','name','fechaNac','identification','cellphone','email','password','cargoId','estado'],relations:['cargoId']});

    return users;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {

    const users = await this.userRepository.findOne({where:{id:id},select:['id','name','fechaNac','identification','cellphone','email','password','cargoId','estado'],relations:['cargoId']});
    
    return users;
  }

  async filtrarUsers(filtros: FiltrarUserDto) {
    console.log("entro aca");
  const qb = this.userRepository.createQueryBuilder('user')
    .leftJoin('user.cargoId','cargo')
    .select([
      'user.id',
      'user.name',
      'user.email',
      'user.cellphone',
      'user.identification',
      'user.fechaNac',
      'user.password',
      'user.password',
      'cargo.id',
      'cargo.name'
    ]);

  if (filtros.name) {
    qb.andWhere('user.name LIKE :name', { name: `%${filtros.name}%` });
  }
  if (filtros.email) {
    qb.andWhere('user.email LIKE :email', { email: `%${filtros.email}%` });
  }
  if (typeof filtros.cargoId === 'number') {
    qb.andWhere('cargo.id = :cargoId', { cargoId: filtros.cargoId });
  }
  if (filtros.identification) {
    qb.andWhere('user.identification LIKE :identification', { identification: `%${filtros.identification}%` });
  }
  if (filtros.cellphone) {
    qb.andWhere('user.cellphone LIKE :cellphone', { cellphone: `%${filtros.cellphone}%` });
  }
  if (typeof filtros.activo === 'boolean') {
    qb.andWhere('user.estado = :estado', { estado: filtros.activo });
  }

  const resultados = await qb.getMany();
  return resultados;
}




  remove(id: number) {
    return `This action removes a #${id} user`;
  }

 /* async deleteUser(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return { msj: 'Usuario no encontrado', validate: false };
      }
      
      await this.userRepository.delete(id);
      return { msj: 'Usuario eliminado correctamente', validate: true };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return { msj: 'Error al eliminar usuario', validate: false, error: error?.message ?? error };
    }
  }*/
}

