import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCargoDto {
    @IsString()
    @IsNotEmpty()
    cargo:string;
    @IsNumber()
    @IsOptional()
    rol:number|null;
}