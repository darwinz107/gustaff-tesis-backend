import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSeccionDto {

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sección es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  seccion: string;

  @IsInt({ message: 'El id de la bodega debe ser un número entero' })
  @IsPositive({ message: 'El id de la bodega debe ser positivo' })
  bodegaId: number;
}
