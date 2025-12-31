import { IsOptional } from "class-validator";
import { Inventario } from "../entities/inventario.entity";
import { RegistroSalida } from "../entities/registroSalida.entity";

export class CreateItemsSalidaSinSMDto {
    
    item:string;
    
    cantidad:number;
    destino:string;
    regSalida:RegistroSalida;
    Observacion:string;
    inventario:Inventario;
    caracteristica:string;
}