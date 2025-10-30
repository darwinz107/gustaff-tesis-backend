import { IsNotEmpty, IsString } from "class-validator";

export class CreateMaquinaDto {
    @IsString()
    @IsNotEmpty()
    area:string;
    @IsString()
    @IsNotEmpty()
    maquina:string;
}