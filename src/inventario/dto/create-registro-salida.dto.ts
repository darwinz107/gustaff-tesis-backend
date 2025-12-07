import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";


export class CreateRegistroSalidaDto {
    
    numActa:string;
    
    total:number;
    numSolicitudCompra:SolicitudDeCompra
}