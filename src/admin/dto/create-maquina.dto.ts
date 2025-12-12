import { IsNotEmpty, IsString } from "class-validator";

export class CreateMaquinaDto {
    @IsString()
    @IsNotEmpty()
    maquina:string;
    @IsString()
    @IsNotEmpty()
    area:string;
}