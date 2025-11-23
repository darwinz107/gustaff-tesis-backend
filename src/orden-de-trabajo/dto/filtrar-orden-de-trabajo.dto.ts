import { Type } from "class-transformer";
import { IsDate, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class FiltrarOrdenDeTrabajoDto {
    @Type(()=> Date)
    @IsDate()
    @IsOptional()
    fechaInicio :Date;
 
    @IsString()
    @IsOptional()
    userSolicitante:string;
}