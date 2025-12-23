import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCargoDto {
    @IsString()
    @IsNotEmpty()
    cargo:string;
    @IsNumber()
    @IsOptional()
    @Type(()=>Number)
    rol:number|null;
}