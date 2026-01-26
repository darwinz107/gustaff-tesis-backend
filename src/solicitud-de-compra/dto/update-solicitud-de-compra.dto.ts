import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeCompraDto } from './create-solicitud-de-compra.dto';
import {  IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsArray } from "class-validator";
import { Type } from 'class-transformer';

export class UpdateItemSolicitadoDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsString()
  caracteristica?: string;

  @IsOptional()
  @IsString()
  Observacion?: string;
}

export class UpdateSolicitudDeCompraDto {

        @IsOptional()
        @IsString()
        Autoriza:string;
        
        @IsOptional()
        @IsString()
        ordenTrabajoId:string;
       
        @IsOptional()
        @IsString()
        estadoCompra:string;

        @IsOptional()
        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => UpdateItemSolicitadoDto)
        itemsSolicitados?: UpdateItemSolicitadoDto[];
}
