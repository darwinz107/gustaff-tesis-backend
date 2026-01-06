import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioDto } from './create-inventario.dto';

export class UpdateInventarioDto {

    nombre?:string;
    descripcion?:string;
    stock?:number
    costo?:number;
    stockMin?:number;
    estado?:boolean;
    imagen?:string;
    bodegaId?:number;
    seccionId?:number;
    perchaId?:number;
}
