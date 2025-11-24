import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AreaDto } from './dto/area.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { CreateTipoTrabajoDto } from './dto/create-tipo-trabajo.dto';
import { MaquinaDto } from './dto/maquina.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
   
  @Post("create/user")
   createUser(@Body() createUserDto:CreateUserDto) {
      return this.adminService.createUser(createUserDto);
    }

   @Post("create/area")
    createArea(@Body() createAreaDto:CreateAreaDto) {
      return this.adminService.crearArea(createAreaDto);
    }
  y
    @Post("create/maquina")
    createMaquina(@Body() createMaquinaDto:CreateMaquinaDto){
      return this.adminService.createMaquina(createMaquinaDto);
    }
  
    @Get()
    findAll() {
      return this.adminService.findAll();
    }
  
    @Post('all/codigos')
    findAllCodbyArea(@Body() areaDto:AreaDto) {
      return this.adminService.findAllCodbyArea(areaDto);
    }
  
    @Post('all/maquinas')
    findAllMaquinasByCod(@Body() maquinaDto:MaquinaDto) {
      return this.adminService.findAllMaquinasByCod(maquinaDto);
    }
  
    @Post('create/categoria')
    createCategoria(@Body() createCategoriaDto:CreateCategoriaDto){
      return this.adminService.createCategoria(createCategoriaDto);
    }
    
    @Get('categorias/all')
    findAllCategorias(){
      return this.adminService.findAllCategorias();
    }

    @Post('create/tipoTrabajo')
    createTipoTrabajo(@Body() createTipoTrabajoDto:CreateTipoTrabajoDto){
      return this.adminService.createTipoTrabajo(createTipoTrabajoDto);
    }
     
    @Post('create/cargo')
    createCargo(@Body() createCargoDto:CreateCargoDto){
      return this.adminService.createCargo(createCargoDto);
    }

        @Get('roles/all')
    findAllRoles(){
      return this.adminService.allroles();
    }

        @Get('cargos/all')
    findAllRCargos(){
      return this.adminService.allCargos();
    }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Get('all/tipo-trabajo')
  findAllTipoTrabajo(){
    return this.adminService.findAllTipoTrabajo();
  }

  @Patch('user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
