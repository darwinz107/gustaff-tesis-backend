import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateActaSalidaDto {
    @IsNotEmpty()
    @IsNumber()
    entregaId:number;
    @IsOptional()
    @IsString()
    observacion:string;
}