export class CreateActaEntradaDto {
  proovedor: number;

  numFactura: string;
total:number;
  itemsSolicitados: {
    //id:number|null;
    nombre: string;
    cantidad: number;
    stockMin: number;
    costo: number;
    descuento: number;
    iva: boolean;
    subtotal: number;
    total: number;
    bodega: string;
    seccion: string;
    percha: string;
    Observacion: string;
    
  }[];
}
