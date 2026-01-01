import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { CreateItemsSolicitadosDto } from './dto/create-items-solicitados.dto';
import { StockDto } from './dto/stock.dto';
import { CreateActaSalidaDto } from './dto/create-acta-salida.dto';
import { CreateActaEntradaDto } from './dto/create-acta-entrada.dto';
import { CreateProovedorDto } from './dto/create-proovedor.dto';
import { FiltrarActaEntradaDto } from './dto/filtrar-acta-entrada.dto';
import { FiltrarActaSalidaDto } from './dto/filtrar-acta-salida.dto';
import { FiltrarInventarioDto } from './dto/filtrar-inventario.dto';
import { CreateActaSalidaSinSMDto } from './dto/create-acta-salida-sm.dto';

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

  @Post('crear-proovedor')
  createProovedor(@Body() createProovedorDto: CreateProovedorDto){
    return this.inventarioService.createProovedor(createProovedorDto);
  }

   @Post('acta-salida/:id')
  createActaSalida(@Param('id') id: string, @Body() createActaSalidaDto:CreateActaSalidaDto) {
    return this.inventarioService.createActaSalida(+id, createActaSalidaDto);
  }

  @Post('acta-salida/sin-orden/crear')
  createActaSalidaSinSM(@Body() createActaSalidaSinSMDto:CreateActaSalidaSinSMDto) {
  console.log('Controller - createActaSalidaSinSM DTO:', createActaSalidaSinSMDto);
  return this.inventarioService.createActaSalidaSinSM(createActaSalidaSinSMDto);
  }

   @Post('acta-entrada/:id')
  createActaEntrada(@Param('id') id: string,@Body() createActaEntradaDto:CreateActaEntradaDto) {
    return this.inventarioService.createActaEntrada(+id,createActaEntradaDto);
  }

  @Get('acta-salida-by/:id')
  actaDeSalidaByIdCompra(@Param('id') id: string) {
    return this.inventarioService.actaDeSalidaByIdCompra(+id);
  }

  @Post('validar-item')
  existeItem(@Body() findItemDto:{item: string}) {
    return this.inventarioService.existeItem(findItemDto.item);
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

   @Post('proovedores')
  findProovedorByNombre(@Body() proovedor:{nombre:string}) {
    return this.inventarioService.findProovedorByNombre(proovedor.nombre);
  }

  @Get('bodegas')
    async getAllBodegas() {
      const bodegas = await this.inventarioService.precargarBodegas();
      return bodegas;
    }

  @Get('secciones/:bodegaId')
  async getSeccionesByBodega(@Param('bodegaId') bodegaId: number) {
    const secciones = await this.inventarioService.findSeccionesByBodega(bodegaId);
    return secciones;
  }

  
  @Get('perchas/:seccionId')
  async getPerchasBySeccion(@Param('seccionId') seccionId: number) {
    const perchas = await this.inventarioService.findPerchasBySeccion(seccionId);
    return perchas;
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioDto: UpdateInventarioDto) {
    return this.inventarioService.update(+id, updateInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioService.remove(+id);
  }

  
  @Post('actas-entradas/filter')
  async filtrarActas(@Body() filtros: FiltrarActaEntradaDto) {
    return await this.inventarioService.filtrarActasEntrada(filtros);
  }
  
  
  @Post('actas-salidas/filter')
  async filtrarActasSalida(@Body() filtros: FiltrarActaSalidaDto) {
    return await this.inventarioService.filtrarActasSalida(filtros);
  }

    @Post('filtrar-inventarios')
  async filtrar(@Body() filtros: FiltrarInventarioDto) {
    return await this.inventarioService.filtrarInventarios(filtros);
  }

}
