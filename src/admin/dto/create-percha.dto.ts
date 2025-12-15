import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePerchaDto {

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la percha es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  percha: string;

  @IsInt({ message: 'El id de la sección debe ser un número entero' })
  @IsPositive({ message: 'El id de la sección debe ser positivo' })
  seccionId: number;
}
