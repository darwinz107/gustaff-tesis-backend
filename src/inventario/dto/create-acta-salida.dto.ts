import { IsOptional } from "class-validator";

export class CreateActaSalidaDto {
    @IsOptional()
    entrega:string;
    @IsOptional()
    observacion:string;

}