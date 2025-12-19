import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Role } from "src/roles/entities/role.entity";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   name:string;
   @IsNumber()
   @IsNotEmpty()
   @MaxLength(10)
   @MinLength(10)
    identification?:number;
    @IsNumber()
    @IsNotEmpty()
    
    cellphone:number;
    @IsEmail()
    @IsNotEmpty()
    email:string;
    @IsString()
    @MinLength(8)
    password:string;
    @Type(()=>Date)
    @IsDate()
    @IsEmpty()
    fechaNac:Date;
    @IsNumber()
    @IsNotEmpty()
    cargo:number;

}
