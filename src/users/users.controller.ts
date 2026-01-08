import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltrarUserDto } from './dto/filtrar-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*@Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }*/

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get('supervisores')
findSupervisores() {
  return this.usersService.findUsersBySupervisorRoles();
}

@Get('gerencia-coordinacion')
findGerenciaYCoordinacion() {
  return this.usersService.findUsersGerenciaYCoordinacion();
}


  @Get('users/all')
  findAllUsers(){
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post('filter')
  async filtrar(@Body() filtros: FiltrarUserDto) {
    return await this.usersService.filtrarUsers(filtros);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
