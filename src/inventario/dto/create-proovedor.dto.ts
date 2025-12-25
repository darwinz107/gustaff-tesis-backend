import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateProovedorDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  nombreComercial: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsString()
  @Length(13, 13, { message: 'El RUC debe tener exactamente 13 dígitos' })
  ruc: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsEmail()
  email: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsString()
  @Length(7, 15)
  telefono: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @IsOptional()
  @Transform(({value})=>{value === '' ? null : value})
  @IsString()
  
  notas?: string;
}
