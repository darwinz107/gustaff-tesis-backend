import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { User } from "src/users/entities/user.entity";


export class CreateRegistroSalidaDto {
    
    numActa:string;
    
    total:number;
    numSolicitudCompra:SolicitudDeCompra;
    entrega:User;
    observacion:string;
}