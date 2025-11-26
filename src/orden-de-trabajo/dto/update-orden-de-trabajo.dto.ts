import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudOrdenDto } from './create-solicitud-orden.dto';


export class UpdateOrdenDeTrabajoDto extends PartialType(CreateSolicitudOrdenDto) {}
