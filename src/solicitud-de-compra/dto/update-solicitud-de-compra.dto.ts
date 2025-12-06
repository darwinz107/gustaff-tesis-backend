import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeCompraDto } from './create-solicitud-de-compra.dto';
import {  IsEmpty, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

export class UpdateSolicitudDeCompraDto {
        @IsString()
        @IsNotEmpty()
        Autoriza:string;
        @IsNotEmpty()
        @IsNumber()
        ordenTrabajoId:string;
        @IsEmpty()
        @IsString()
        Destino:string;
}
