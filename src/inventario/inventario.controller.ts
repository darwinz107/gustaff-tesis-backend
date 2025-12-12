import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { CreateItemsSolicitadosDto } from './dto/create-items-solicitados.dto';
import { StockDto } from './dto/stock.dto';
import { CreateActaSalidaDto } from './dto/create-acta-salida.dto';
import { CreateActaEntradaDto } from './dto/create-acta-entrada.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Post('filtrar')
  filtrarInventario(@Body('item') item: string){
    return this.inventarioService.filtrarInventario(item);
  }

  @Post('evaluar-stock')
  evaluarStock(@Body() stockDto: StockDto){
    return this.inventarioService.evaluarStock(stockDto);
  }

   @Post('acta-salida/:id')
  createActaSalida(@Param('id') id: string, @Body() createActaSalidaDto:CreateActaSalidaDto) {
    return this.inventarioService.createActaSalida(+id, createActaSalidaDto);
  }

   @Post('acta-entrada/:id')
  createActaEntrada(@Param('id') id: string,@Body() createActaEntradaDto:CreateActaEntradaDto) {
    return this.inventarioService.createActaEntrada(+id,createActaEntradaDto);
  }

  @Get('acta-salida-by/:id')
  actaDeSalidaByIdCompra(@Param('id') id: string) {
    return this.inventarioService.actaDeSalidaByIdCompra(+id);
  }

  @Get('acta-entrada-by/:id')
  actaDeEntradaByIdCompra(@Param('id') id: string) {
    return this.inventarioService.actaDeEntradaByIdCompra(+id);
  }

  @Get('actas-salidas')
  findAllRegistroSalida() {
    return this.inventarioService.findAllRegistroSalida();
  }

  @Get('actas-entradas')
  findAllRegistroEntrada() {
    return this.inventarioService.findAllRegistroEntrada();
  }

  @Get('info-entrada/:id')
  asignarInfoActaEntrada(@Param('id') id:string) {
    return this.inventarioService.asignarInfoActaEntrada(+id);
  }

 /* @Post('items-solicitados')
  createItemsSolicitados(@Body() createItemsSolicitadosDto: CreateItemsSolicitadosDto) {
    return this.inventarioService.createItemsSolicitados(createItemsSolicitadosDto);
  }*/

  @Get()
  findAll() {
    return this.inventarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioDto: UpdateInventarioDto) {
    return this.inventarioService.update(+id, updateInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioService.remove(+id);
  }
}
