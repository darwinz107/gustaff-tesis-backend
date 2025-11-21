import { IsNotEmpty, IsString } from "class-validator";

export class CreateTipoTrabajoDto{
    @IsString()
    @IsNotEmpty()
    tipo:string;
}