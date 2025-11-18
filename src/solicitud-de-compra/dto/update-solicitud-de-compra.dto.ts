import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeCompraDto } from './create-solicitud-de-compra.dto';

export class UpdateSolicitudDeCompraDto extends PartialType(CreateSolicitudDeCompraDto) {}
