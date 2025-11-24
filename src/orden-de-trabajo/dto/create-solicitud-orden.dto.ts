import { Type } from "class-transformer";
import { IsDate, IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateSolicitudOrdenDto {
    @IsEmpty()
    NumOrden:string;
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
    @IsEmpty()
    @IsString()
    EspecificacionMaquina:string;
    @IsNotEmpty()
    @IsString()
    Categoria:string;
    @IsNotEmpty()
    @IsString()
    TipoTrabajo:string;
    @IsEmpty()
    @IsString()
    DescripcionTrabajo:string;
    @IsString()
    @IsNotEmpty()
    userSolicitante:string;
    @IsString()
    @IsNotEmpty()
    userReceptor:string;
    @IsString()
    @IsEmpty()
    
    userTecnico:string;  
}