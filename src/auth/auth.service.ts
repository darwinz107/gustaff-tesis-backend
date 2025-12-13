import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'src/parametro/entities/area.entity';
import { Categoria } from 'src/parametro/entities/categoria.entity';
import { Codigo } from 'src/parametro/entities/codigo.entity';
import { Maquina } from 'src/parametro/entities/maquina.entity';
import { TipoTrabajo } from 'src/parametro/entities/tipoTrabajo.entity';
import { AreaDto } from '../admin/dto/area.dto';
import { CreateAreaDto } from '../admin/dto/create-area.dto';
import { CreateCategoriaDto } from '../admin/dto/create-categoria.dto';
import { CreateMaquinaDto } from '../admin/dto/create-maquina.dto';
import { MaquinaDto } from '../admin/dto/maquina.dto';
import { CreateTipoTrabajoDto } from '../admin/dto/create-tipo-trabajo.dto';
import { Role } from 'src/roles/entities/role.entity';
import { CreateCargoDto } from '../admin/dto/create-cargo.dto';
import { Cargo } from 'src/users/entities/cargo.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService{

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  @InjectRepository(Area) private readonly areaRepository:Repository<Area>,
  @InjectRepository(Categoria) private readonly categoriaRepository:Repository<Categoria>,
  @InjectRepository(Codigo) private readonly codigoRepository:Repository<Codigo>,
  @InjectRepository(Maquina) private readonly maquinaRepository:Repository<Maquina>,
  @InjectRepository(TipoTrabajo) private readonly tipoTrabajoRepository:Repository<TipoTrabajo>, 
  @InjectRepository(Cargo) private readonly cargoRepository:Repository<Cargo>, 
  @InjectRepository(Role) private readonly roleRepository:Repository<Role>, 
 private readonly jwtService:JwtService,
){}
  

  async createToken(createAuthDto: CreateAuthDto,response:Response) {
    
    const login = await this.userRepository.findOne({where:{email:createAuthDto.email},relations:['cargoId']});
    const rol = await this.roleRepository.findOne({where:{cargo:{id:login?.cargoId.id}}});

    if(!login){
      
    return new NotFoundException("Usuario no valido");
    }

    if(!rol){
      
    return new NotFoundException("Rol no valido");
    }

    const validatePassword = await bcrypt.compare(createAuthDto.password,login.password);
  
    if(validatePassword == false){
       return new NotFoundException("Contraseña incorrecta");
    }

    console.log("login",login);
    const token = this.jwtService.sign({id:login.id,rol:rol.id,rolName:rol.role});

    response.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:'none',
      maxAge:3600*10000
    });

    return {msj:"Bienvenido",access:true};
  }

  async logout(response:Response){
  
    response.clearCookie("token",{
      httpOnly:true,
      secure:true,
      sameSite:'none'
    });

    response.send({
      msj:"Sesion terminada"
    });
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
