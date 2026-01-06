import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type,Exclude } from 'class-transformer';

export class CreateActaEntradaDto {
  proovedor: string;

  factura: string;
total:number;

 @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitado)
  itemsSolicitados: ItemSolicitado[];
}

class ItemSolicitado {

  @IsString()
  nombre: string;

  @IsInt()
  @Type(() => Number)
  cantidad: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  stockMin: number;

  @IsNumber()
  @Type(() => Number)
  costo: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  descuento: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  iva: boolean;

  @IsNumber()
  @Type(() => Number)
  subtotal: number;

  @IsNumber()
  @Type(() => Number)
  total: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  
  bodegaId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  
  seccionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  
  perchaId: number;

  @IsOptional()
  @IsString()
  Observacion: string;

  @IsOptional()
  @IsString()
  
  imagen: string;

  @IsOptional()
  @IsBoolean()
  @Exclude()
  esActualizado?: boolean;
}

