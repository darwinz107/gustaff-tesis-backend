import { IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateActaSalidaDto {
  @IsOptional()
  @IsInt()
  entregaId?: number;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsInt()
  recibeSinSMId?: number;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsInt()
  solicitanteId?: number;
}
