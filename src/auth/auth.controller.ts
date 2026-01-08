import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Response } from 'express';
import { Rol } from './rol/rol.decorator';
import { AuthGuard } from './auth/auth.guard';
import { AreaDto } from '../admin/dto/area.dto';
import { CreateAreaDto } from '../admin/dto/create-area.dto';
import { CreateCategoriaDto } from '../admin/dto/create-categoria.dto';
import { CreateMaquinaDto } from '../admin/dto/create-maquina.dto';
import { MaquinaDto } from '../admin/dto/maquina.dto';
import { CreateTipoTrabajoDto } from '../admin/dto/create-tipo-trabajo.dto';
import { CreateCargoDto } from '../admin/dto/create-cargo.dto';
import { AuthUser1Guard } from './auth/auth.user1.guard';
import { AuthUser2Guard } from './auth/auth.user2.guard';

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

  @Rol(['ADMIN'])
  @UseGuards(AuthGuard)
  @Get('validate/rol')
  validateRol(){
    return {isRol:true};
  }

  @Rol(['COORDINADOR DE MANTENIMIENTO'])
  @UseGuards(AuthUser1Guard)
  @Get('validate/user1')
  validateRol1(){
    return {isRol:true};
  }

  @Rol(['SUPERVISOR LOGISTICA INTERNA'])
  @UseGuards(AuthUser2Guard)
  @Get('validate/user2')
  validateRol2(){
    return {isRol:true};
  }

  @Get('logout/token')
  logout(@Res() response:Response){
    return this.authService.logout(response);
  }  
  
  

}
