import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenDeTrabajoDto } from './create-orden-de-trabajo.dto';

export class UpdateOrdenDeTrabajoDto extends PartialType(CreateOrdenDeTrabajoDto) {}
