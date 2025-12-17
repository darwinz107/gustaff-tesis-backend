import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateActaSalidaDto {
    @Type(()=>Number)
    @IsNotEmpty()
    @IsNumber()
    entregaId:number;
    @IsOptional()
    @IsString()
    observacion:string;
}