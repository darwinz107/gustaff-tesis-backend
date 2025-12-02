import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudOrdenDto } from './create-solicitud-orden.dto';
import { IsString } from 'class-validator';


export class UpdateOrdenDeTrabajoDto extends PartialType(CreateSolicitudOrdenDto) {
 
    @IsString()
    estado:string;
}
