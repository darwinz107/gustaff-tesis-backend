import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";

export class CreateItemsSolicitadosDto {

  @IsString()
  @IsNotEmpty()
  item: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  cantidad: number;

  @IsString()
  @IsOptional()
  caracteristica?: string;

  @IsString()
  @IsOptional()
  Observacion?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  existencia?: boolean;

  @IsOptional()
  ordenCompra?: SolicitudDeCompra;
}
