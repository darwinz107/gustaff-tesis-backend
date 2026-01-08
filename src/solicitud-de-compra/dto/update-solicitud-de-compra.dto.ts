import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeCompraDto } from './create-solicitud-de-compra.dto';
import {  IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class UpdateSolicitudDeCompraDto {

        @IsOptional()
        @IsString()
        
        Autoriza:string;
        @IsOptional()
        @IsString()
        ordenTrabajoId:string;
       
        @IsOptional()
        @IsString()
        
        estadoCompra:string
}
