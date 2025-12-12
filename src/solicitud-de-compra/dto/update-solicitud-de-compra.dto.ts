import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeCompraDto } from './create-solicitud-de-compra.dto';
import {  IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class UpdateSolicitudDeCompraDto {
        @IsString()
        @IsOptional()
        Autoriza:string;
        @IsOptional()
        @IsNumber()
        ordenTrabajoId:string;
        @IsOptional()
        @IsString()
        Destino:string;
        @IsString()
        @IsOptional()
        estadoCompra:string
}
