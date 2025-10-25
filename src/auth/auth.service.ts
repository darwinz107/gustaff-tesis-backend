import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
 private readonly jwtService:JwtService,
){}

  async createToken(createAuthDto: CreateAuthDto,response:Response) {
    
    const login = await this.userRepository.findOne({where:{email:createAuthDto.email}});

    if(!login){
    return new NotFoundException("Usuario no valido");
    }

    const validatePassword = await bcrypt.compare(createAuthDto.password,login.password);

    if(validatePassword == false){
       return new NotFoundException("Contraseña incorrecta");
    }

    const token = this.jwtService.sign({id:login.id,rol:login.rolId.id},{secret:process.env.SECRET||"messi"});

    response.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:'none',
      maxAge:3600*1000
    });

    return {msj:"Bienvenido",access:true};
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
