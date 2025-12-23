import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Role } from "src/roles/entities/role.entity";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   name:string;
   @IsString()
   @IsNotEmpty()
   @MaxLength(10)
   @MinLength(10)
    identification?:string;
    @IsString()
    @IsNotEmpty()
    
    cellphone:string;
    @IsEmail()
    @IsNotEmpty()
    email:string;
    @IsString()
    //@MinLength(8)
    password:string;
    @Type(()=>Date)
    @IsDate()
    
    fechaNac:Date;
    @IsNumber()
    @IsNotEmpty()
    @Type(()=>Number)
    cargo:number;

}
