import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateSolicitudOrdenDto {
    @Type(()=> Date)
    @IsDate()
    @IsNotEmpty()
    fechaInicio :Date;
    @Type(()=> Date)
    @IsDate()
    @IsNotEmpty()
    fechaFinal:Date;
    
    @IsNotEmpty()
    HoraInicio:Date;
    
    @IsNotEmpty()
    HoraFinal:Date
    @IsNotEmpty()
    @IsString()
    Area:string;
    @IsNotEmpty()
    @IsString()
    Codigo:string;
    @IsNotEmpty()
    @IsString()
    Maquina:string;
    @IsNotEmpty()
    @IsString()
    EspecificacionMaquina:string;
    @IsNotEmpty()
    @IsString()
    Categoria:string;
    @IsNotEmpty()
    @IsString()
    TipoTrabajo:string;
    @IsNotEmpty()
    @IsString()
    DescripcionTrabajo:string;

}