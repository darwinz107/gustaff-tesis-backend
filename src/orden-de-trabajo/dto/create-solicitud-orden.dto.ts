import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsDateString, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateSolicitudOrdenDto {
    @IsEmpty()
    NumOrden:string;

    
    
    @IsDateString()
    @IsNotEmpty()
    fechaInicio :string;
    
    @IsDateString()
    @IsNotEmpty()
    fechaFinal:string;
    
    @IsNotEmpty()
    HoraInicio:string;
    
    @IsNotEmpty()
    HoraFinal:string
    @IsNotEmpty()
    @IsString()
    Area:string;
    @IsNotEmpty()
    @IsString()
    Codigo:string;
    @IsNotEmpty()
    @IsString()
    Maquina:string;
    @IsOptional()
    @IsString()
    EspecificacionMaquina:string;
    @IsNotEmpty()
    @IsString()
    Categoria:string;
    @IsNotEmpty()
    @IsString()
    TipoTrabajo:string;
    @IsOptional()
    @IsString()
    DescripcionTrabajo:string;
    @IsString()
    @IsNotEmpty()
    userSolicitante:string;
    @IsString()
    @IsNotEmpty()
    userReceptor:string;
    @IsString()
    @IsNotEmpty()
    userTecnico:string;
}