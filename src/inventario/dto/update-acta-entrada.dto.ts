import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateActaEntradaDto {
  @IsOptional()
  @IsString()
  factura?: string;

  @IsOptional()
  @Type(()=> Number)
  @IsInt()
  provedorId?: number;

  @IsOptional()
  @Type(()=> Number)
  @IsInt()
  solicitudCompraId?: number;

  @IsOptional()
  @Type(()=> Number)
  @IsInt()
  recibe?: number;
}
