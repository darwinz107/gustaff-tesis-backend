import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParametroService } from './parametro.service';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';

@Controller('parametro')
export class ParametroController {
  constructor(private readonly parametroService: ParametroService) {}

  @Post()
  create(@Body() createParametroDto: CreateParametroDto) {
    return this.parametroService.create(createParametroDto);
  }

  @Get()
  findAll() {
    return this.parametroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParametroDto: UpdateParametroDto) {
    return this.parametroService.update(+id, updateParametroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametroService.remove(+id);
  }
}
