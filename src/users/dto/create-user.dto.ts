import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Role } from "src/roles/entities/role.entity";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   name:string;
   @IsNumber()
   @IsEmpty()
   @MaxLength(10)
   @MinLength(10)
    identification?:number;
    @IsNumber()
    @IsNotEmpty()
    @MaxLength(10)
    @MinLength(10)
    cellphone:number;
    @IsEmail()
    @IsNotEmpty()
    email:string;
    @IsString()
    @MinLength(8)
    password:string;
   

}
