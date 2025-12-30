import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ItemsSalida } from "../entities/itemsSalida.entity";
import { CreateItemsSalidaDto } from "./create-items-salida.dto";

export class CreateActaSalidaSinSMDto {
    @Type(()=>Number)
    @IsNotEmpty()
    @IsNumber()
    entregaId:number;
    @Type(()=>Number)
    @IsNotEmpty()
    @IsNumber()
    recibeId:number;
    @IsOptional()
    @IsString()
    observacion:string;

    itemsSalida:CreateItemsSalidaDto[];
}