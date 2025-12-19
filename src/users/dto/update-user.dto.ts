import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Role } from "src/roles/entities/role.entity";

export class UpdateUserDto{

      
       name?:string;
       
        identification?:number;
       
        
        cellphone?:number;
        
        email?:string;
        
        password?:string;
        @Type(()=>Date)
        
        fechaNac?:Date;
        
        cargo?:number;
    
}
