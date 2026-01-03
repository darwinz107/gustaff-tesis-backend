import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateActaEntradaDto {
  @IsOptional()
  @IsString()
  factura?: string;

  @IsOptional()
  @IsInt()
  provedorId?: number;

  @IsOptional()
  @IsInt()
  solicitudCompraId?: number;
}
