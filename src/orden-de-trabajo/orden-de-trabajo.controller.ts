import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';

@Controller('orden-de-trabajo')
export class OrdenDeTrabajoController {
  constructor(private readonly ordenDeTrabajoService: OrdenDeTrabajoService) {}

  @Post()
  create(@Body() area: string) {
    return this.ordenDeTrabajoService.crearArea(area);
  }

  @Get()
  findAll() {
    return this.ordenDeTrabajoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenDeTrabajoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrdenDeTrabajoDto: UpdateOrdenDeTrabajoDto) {
    return this.ordenDeTrabajoService.update(+id, updateOrdenDeTrabajoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordenDeTrabajoService.remove(+id);
  }
}
