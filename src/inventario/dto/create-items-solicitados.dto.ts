import { IsBoolean, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";

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
    @IsBoolean()
    @IsEmpty()
    existencia:boolean;
    @IsEmpty()
    ordenCompra:SolicitudDeCompra
}
