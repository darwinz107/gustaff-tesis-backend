import { IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateActaSalidaDto {
  @IsOptional()
  @IsInt()
  entregaId?: number;

  @IsOptional()
  @IsString()
  observacion?: string;

    @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsInt()
  recibeSinSMId?: number;


  @IsOptional()
  @IsInt()
  solicitanteId?: number;
}
