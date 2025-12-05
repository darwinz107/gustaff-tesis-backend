import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';

import { UpdateOrdenDeTrabajoDto } from './dto/update-orden-de-trabajo.dto';
import { create } from 'domain';
import { CreateAreaDto } from '../admin/dto/create-area.dto';
import { CreateMaquinaDto } from '../admin/dto/create-maquina.dto';
import { AreaDto } from '../admin/dto/area.dto';
import { MaquinaDto } from '../admin/dto/maquina.dto';
import { CreateCategoriaDto } from '../admin/dto/create-categoria.dto';
import { CreateSolicitudOrdenDto } from './dto/create-solicitud-orden.dto';
import { CreateTipoTrabajoDto } from '../admin/dto/create-tipo-trabajo.dto';
import { FiltrarOrdenDeTrabajoDto } from './dto/filtrar-orden-de-trabajo.dto';

@Controller('orden-de-trabajo')
export class OrdenDeTrabajoController {
  constructor(private readonly ordenDeTrabajoService: OrdenDeTrabajoService) {}

 @Get('all-ordenes')
 getAllOrdenesTrabajo(){
  return this.ordenDeTrabajoService.getAllOrdenesTrabajo();
 }

  @Get('all-ordenes-sin-uso')
 getAllOrdenesTrabajoSinUso(){
  return this.ordenDeTrabajoService.getAllOrdenesTrabajoSinUso();
 }

  @Post('orden-by-solicitante')
 getOrdenTrabajoBySolicitante(@Body() searchbyuser:{solicitante:string}){
  return this.ordenDeTrabajoService.getOrdenTrabajoBySolicitante(searchbyuser.solicitante);
 }

 @Get('orden-by-id/:id')
  getOrdenTrabajoById(@Param('id') id:string){
    return this.ordenDeTrabajoService.getOrdenTrabajoById(+id);
  }

  @Post('create/solicitud-orden')
  registerSolicituOrden(@Body() createSolicitudOrdenDto:CreateSolicitudOrdenDto){
    return this.ordenDeTrabajoService.registerSolicitudOrden(createSolicitudOrdenDto);
  }

  @Post('filtrar/solicitud-orden')
  filtrarOrdenDeTrabajo(@Body() filtrarOrdenDeTrabajoDto:FiltrarOrdenDeTrabajoDto){
    return this.ordenDeTrabajoService.filtrarOrdenDeTrabajo(filtrarOrdenDeTrabajoDto);
  }

  /*@Post('create/tipo-trabajo')
  registerTipoTrabajo(@Body() createTipoTrabajoDto:CreateTipoTrabajoDto){
    return this.ordenDeTrabajoService.registerTipoTrabajo(createTipoTrabajoDto);
  }

  @Get('all/tipo-trabajo/:categoria')
  getAllTipoTrabajoByCategoria(@Param('categoria') categoria:string){
    return this.ordenDeTrabajoService.getAllTipoTrabajoByCategoria(categoria);
  }*/

  @Get("last/solicitud/:id")
  getSolicitudReciente(@Param('id') id:string){
    return this.ordenDeTrabajoService.getSolicitudReciente(+id);
  }

  @Get("estados")
  getEstadosTrabajo(){
    return this.ordenDeTrabajoService.getEstadosTrabajo();
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
