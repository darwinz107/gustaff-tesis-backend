import { RegistroSalida } from "../entities/registroSalida.entity";

export class CreateItemsSalidaDto {
    
    item:string;
    
    cantidad:number;
    destino:string;
    regSalida:RegistroSalida;
}