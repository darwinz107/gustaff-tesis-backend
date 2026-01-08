import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateItemsSolicitadosDto } from "src/inventario/dto/create-items-solicitados.dto";

export class CreateSolicitudDeCompraDto {

    @IsString()
    @IsNotEmpty()
    Autoriza:string;
    @IsNotEmpty()
    @IsNumber()
    ordenTrabajoId:number;
   
    @IsArray()
    @ValidateNested({each:true})
    @Type(()=>CreateItemsSolicitadosDto)
    items:CreateItemsSolicitadosDto[];
}
