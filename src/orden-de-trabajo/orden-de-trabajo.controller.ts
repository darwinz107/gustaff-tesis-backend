import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { create } from 'domain';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { AreaDto } from './dto/area.dto';
import { MaquinaDto } from './dto/maquina.dto';

@Controller('orden-de-trabajo')
export class OrdenDeTrabajoController {
  constructor(private readonly ordenDeTrabajoService: OrdenDeTrabajoService) {}

  @Post("create/area")
  createArea(@Body() createAreaDto:CreateAreaDto) {
    return this.ordenDeTrabajoService.crearArea(createAreaDto);
  }

  @Post("create/maquina")
  createMaquina(@Body() createMaquinaDto:CreateMaquinaDto){
    return this.ordenDeTrabajoService.createMaquina(createMaquinaDto);
  }

  @Get()
  findAll() {
    return this.ordenDeTrabajoService.findAll();
  }

  @Post('all/codigos')
  findAllCodbyArea(@Body() areaDto:AreaDto) {
    return this.ordenDeTrabajoService.findAllCodbyArea(areaDto);
  }

  @Post('all/maquinas')
  findAllMaquinasByCod(@Body() maquinaDto:MaquinaDto) {
    return this.ordenDeTrabajoService.findAllMaquinasByCod(maquinaDto);
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
