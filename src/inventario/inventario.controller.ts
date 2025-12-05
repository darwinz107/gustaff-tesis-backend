import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { CreateItemsSolicitadosDto } from './dto/create-items-solicitados.dto';
import { StockDto } from './dto/stock.dto';

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
