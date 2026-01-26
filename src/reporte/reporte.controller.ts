import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Response } from 'express';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  create(@Body() createReporteDto: CreateReporteDto) {
    return this.reporteService.create(createReporteDto);
  }

  @Get()
  findAll() {
    return this.reporteService.findAll();
  }

  @Get('orden-trabajo')
  generarReporteOrdenTrabajo(@Res() res: Response) {
    return this.reporteService.generarReporteOrdenTrabajo(res);
  }

  @Get('acta-salida')
  generarReporteActaSalida(@Res() res: Response) {
    return this.reporteService.generarReporteActaSalida(res);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReporteDto: UpdateReporteDto) {
    return this.reporteService.update(+id, updateReporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reporteService.remove(+id);
  }
}
