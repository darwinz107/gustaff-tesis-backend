import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsNull } from "typeorm";

export class CreateMaquinaDto {
    @IsString()
    @IsNotEmpty()
    maquina:string;
    @IsString()
    @IsNotEmpty()
    area:string;

     @IsOptional()
    @IsString()
    imagen:string;
}