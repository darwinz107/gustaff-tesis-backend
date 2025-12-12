import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCargoDto {
    @IsString()
    @IsNotEmpty()
    cargo:string;
    @IsNumber()
    @IsNotEmpty()
    rol:number;
}