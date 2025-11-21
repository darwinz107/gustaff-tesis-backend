import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';
import { CreateOrdenDeTrabajoDto } from './dto/create-orden-de-trabajo.dto';
import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { create } from 'domain';
import { CreateAreaDto } from '../auth/dto/create-area.dto';
import { CreateMaquinaDto } from '../auth/dto/create-maquina.dto';
import { AreaDto } from '../auth/dto/area.dto';
import { MaquinaDto } from '../auth/dto/maquina.dto';
import { CreateCategoriaDto } from '../auth/dto/create-categoria.dto';
import { CreateSolicitudOrdenDto } from './dto/create-solicitud-orden.dto';
import { CreateTipoTrabajoDto } from '../auth/dto/create-tipo-trabajo.dto';

@Controller('orden-de-trabajo')
export class OrdenDeTrabajoController {
  constructor(private readonly ordenDeTrabajoService: OrdenDeTrabajoService) {}

 

  @Post('create/solicitud-orden')
  registerSolicituOrden(@Body() createSolicitudOrdenDto:CreateSolicitudOrdenDto){
    return this.ordenDeTrabajoService.registerSolicitudOrden(createSolicitudOrdenDto);
  }

  /*@Post('create/tipo-trabajo')
  registerTipoTrabajo(@Body() createTipoTrabajoDto:CreateTipoTrabajoDto){
    return this.ordenDeTrabajoService.registerTipoTrabajo(createTipoTrabajoDto);
  }

  @Get('all/tipo-trabajo/:categoria')
  getAllTipoTrabajoByCategoria(@Param('categoria') categoria:string){
    return this.ordenDeTrabajoService.getAllTipoTrabajoByCategoria(categoria);
  }*/

  @Get("last/solicitud")
  getSolicitudReciente(){
    return this.ordenDeTrabajoService.getSolicitudReciente();
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
