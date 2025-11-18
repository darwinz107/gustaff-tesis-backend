import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';
import { CreateSolicitudDeCompraDto } from './dto/create-solicitud-de-compra.dto';
import { UpdateSolicitudDeCompraDto } from './dto/update-solicitud-de-compra.dto';

@Controller('solicitud-de-compra')
export class SolicitudDeCompraController {
  constructor(private readonly solicitudDeCompraService: SolicitudDeCompraService) {}

  @Post()
  create(@Body() createSolicitudDeCompraDto: CreateSolicitudDeCompraDto) {
    return this.solicitudDeCompraService.create(createSolicitudDeCompraDto);
  }

  @Get()
  findAll() {
    return this.solicitudDeCompraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudDeCompraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudDeCompraDto: UpdateSolicitudDeCompraDto) {
    return this.solicitudDeCompraService.update(+id, updateSolicitudDeCompraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudDeCompraService.remove(+id);
  }
}
