import { Type } from "class-transformer";
import { IsDate, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class FiltrarOrdenDeTrabajoDto {
    @Type(()=> Date)
    @IsDate()
    @IsEmpty()
    @IsOptional()
    fechaInicio :Date;
 
    @IsString()
    @IsOptional()
    @IsEmpty()
    userSolicitante:string;
}