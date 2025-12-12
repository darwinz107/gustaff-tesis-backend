import { PartialType } from '@nestjs/mapped-types';
import { CreateParametroDto } from './create-parametro.dto';

export class UpdateParametroDto extends PartialType(CreateParametroDto) {}
