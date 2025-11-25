import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateItemsSolicitadosDto {
    @IsString()
    @IsNotEmpty()
    item:string;
    @IsNotEmpty()
    @IsNumber()
    cantidad:number;
    @IsString()
    @IsEmpty()
    caracteristica:string;
    @IsString()
    @IsEmpty()
    Observacion:string; 
    @IsNotEmpty()
    @IsNumber()
    ordenTrabajoId:number;
}
