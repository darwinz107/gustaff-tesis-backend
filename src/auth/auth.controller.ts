import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Response } from 'express';
import { Rol } from './rol/rol.decorator';
import { AuthGuard } from './auth/auth.guard';
import { AreaDto } from './dto/area.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { MaquinaDto } from './dto/maquina.dto';
import { CreateTipoTrabajoDto } from './dto/create-tipo-trabajo.dto';
import { CreateCargoDto } from './dto/create-cargo.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  create(@Body() createAuthDto: CreateAuthDto,@Res({passthrough:true}) response:Response) {
    return this.authService.createToken(createAuthDto,response);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Rol(['admin'])
  @UseGuards(AuthGuard)
  @Get('validate/rol')
  validateRol(){
    return {isRol:true};
  }

  @Get('logout/token')
  logout(@Res() response:Response){
    return this.authService.logout(response);
  }  
  
   @Post("create/area")
    createArea(@Body() createAreaDto:CreateAreaDto) {
      return this.authService.crearArea(createAreaDto);
    }
  
    @Post("create/maquina")
    createMaquina(@Body() createMaquinaDto:CreateMaquinaDto){
      return this.authService.createMaquina(createMaquinaDto);
    }
  
    @Get()
    findAll() {
      return this.authService.findAll();
    }
  
    @Post('all/codigos')
    findAllCodbyArea(@Body() areaDto:AreaDto) {
      return this.authService.findAllCodbyArea(areaDto);
    }
  
    @Post('all/maquinas')
    findAllMaquinasByCod(@Body() maquinaDto:MaquinaDto) {
      return this.authService.findAllMaquinasByCod(maquinaDto);
    }
  
    @Post('create/categoria')
    createCategoria(@Body() createCategoriaDto:CreateCategoriaDto){
      return this.authService.createCategoria(createCategoriaDto);
    }
    
    @Get('categorias/all')
    findAllCategorias(){
      return this.authService.findAllCategorias();
    }

    @Post('create/tipoTrabajo')
    createTipoTrabajo(@Body() createTipoTrabajoDto:CreateTipoTrabajoDto){
      return this.authService.createTipoTrabajo(createTipoTrabajoDto);
    }
     
    @Post('create/cargo')
    createCargo(@Body() createCargoDto:CreateCargoDto){
      return this.authService.createCargo(createCargoDto);
    }

}
