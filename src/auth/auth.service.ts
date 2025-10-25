import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {

  constructor(@Injectable(User) private readonly userRepository:Repository<User>,
 private readonly jwtService:JwtService,
){}

  createToken(createAuthDto: CreateAuthDto,response:Response) {
    
    const login = await this.userRepository.findOne({where:{email:createAuthDto.email}});

    if(!login){
    return NotFoundException("Usuario no valido");
    }

    const validatePassword = bcrypt.compare(createAuthDto.password,login.password);

    if(validatePassword ==false){
       return NotFoundException("Contraseña incorrecta");
    }

    const token = this.jwtService.sign({id:login.id,rol:login.rolId.id},{secret:process.env.SECRET||"messi"});

    response.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:'none',
      maxAge:3600*1000
    });

    return {msj:"Bienvenido"};
  }

  findAll() {
    return `This action returns all auth`;
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
