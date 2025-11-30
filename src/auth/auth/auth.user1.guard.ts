import { BadRequestException,CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';


import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '../rol/rol.decorator';

@Injectable()
export class AuthUser1Guard implements CanActivate {

  constructor(private reflector:Reflector,
  private readonly jwtService:JwtService,){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean>{
      const rol = this.reflector.get(Rol,context.getHandler());
        if(!rol){
          return true;
        }
         
        const request = context.switchToHttp().getRequest() as Request;
        
        try {
         
          const token = request.cookies.token || request.headers.authorization?.split(' ')[1];
    
          if(!token){
             return true;
          }
    
          const validate = this.jwtService.verify(token);
    
          if(!validate){
            return true;
          }
          console.log(validate.rolName);
          const validateRol = rol.includes(validate.rolName);
          console.log(validateRol);
    
          return validateRol;
          
        } catch (error) {
          console.error(error);
         throw new BadRequestException("No se encontro un token");
        }
      
  }
}
