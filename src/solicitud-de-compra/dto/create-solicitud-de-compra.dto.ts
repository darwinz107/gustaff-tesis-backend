import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSolicitudDeCompraDto {

    @IsString()
    @IsNotEmpty()
    Autoriza:string;
    @IsNotEmpty()
    @IsNumber()
    ordenTrabajoId:number;
    @IsEmpty()
    @IsString()
    Destino:string;
}
