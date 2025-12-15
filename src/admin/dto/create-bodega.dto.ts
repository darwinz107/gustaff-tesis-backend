import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBodegaDto {

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la bodega es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  bodega: string;
}
