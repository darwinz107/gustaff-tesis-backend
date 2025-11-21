import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'src/parametro/entities/area.entity';
import { Categoria } from 'src/parametro/entities/categoria.entity';
import { Codigo } from 'src/parametro/entities/codigo.entity';
import { Maquina } from 'src/parametro/entities/maquina.entity';
import { TipoTrabajo } from 'src/parametro/entities/tipoTrabajo.entity';
import { AreaDto } from './dto/area.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { MaquinaDto } from './dto/maquina.dto';
import { CreateTipoTrabajoDto } from './dto/create-tipo-trabajo.dto';
import { Role } from 'src/roles/entities/role.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { Cargo } from 'src/users/entities/cargo.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService implements OnModuleInit{

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  @InjectRepository(Area) private readonly areaRepository:Repository<Area>,
  @InjectRepository(Categoria) private readonly categoriaRepository:Repository<Categoria>,
  @InjectRepository(Codigo) private readonly codigoRepository:Repository<Codigo>,
  @InjectRepository(Maquina) private readonly maquinaRepository:Repository<Maquina>,
  @InjectRepository(TipoTrabajo) private readonly tipoTrabajoRepository:Repository<TipoTrabajo>, 
  @InjectRepository(Cargo) private readonly cargoRepository:Repository<Cargo>, 
  @InjectRepository(Role) private readonly roleRepository:Repository<Role>, 
 private readonly jwtService:JwtService,
){}
  async onModuleInit() {
    const searchUsers = await this.userRepository.find();
   if(searchUsers.length == 0){
      const passHashed =await bcrypt.hash("admin",10);
      const admin = this.userRepository.create({email:"admin@gmail.com",password:passHashed,cargoId:{id:1}});
      await this.userRepository.save(admin);
   }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      console.log("entro");
      const cargo = await this.cargoRepository.findOne({where:{id:2}});

    const user = await this.userRepository.findOne({where:{email:createUserDto.email}});

    if(user){
    return Error("Correo ya registrado"); 
    }

    if(!rol){
    return new NotFoundException("rol");
    }
    

    const passHashed = await bcrypt.hash(createUserDto.password,10);
     console.log(passHashed);
    createUserDto.password = passHashed;
 
    const createUser = this.userRepository.create(createUserDto);
    createUser.rolId = rol;
    await this.userRepository.save(createUser);
    return {msj:'Usuario creado!'};
    } catch (error) {
      return Error(error);
    }
    
  }

  /*async createUser(params:type) {
    
  }*/

    async crearArea(createAreaDto: CreateAreaDto) {
  
  
  
      if (!createAreaDto) {
        return { msj: "No se permite valores vacios" };
      }
  
      const newArea = this.areaRepository.create({ nombre: createAreaDto.area});
      await this.areaRepository.save(newArea);
  
      return { msj: 'This action adds a new crearArea' };
    }
  
    async createMaquina(createMaquinaDto: CreateMaquinaDto) {
  
      if (!createMaquinaDto.area) {
        return { msj: "Asigne una area a la maquina" };
      }
  
      if (!createMaquinaDto.maquina) {
        return { msj: "Ingrese una maquina" };
      }
  
      const searchArea = await this.areaRepository.findOne({
        where: {
          nombre: createMaquinaDto.area
        }
      });
  
      if (!searchArea) {
        return { msj: "No existe esa area, digite una existente" }
      }
  
      const maquinalgt = await this.maquinaRepository.find();
  
      const newCod =  `GU-${createMaquinaDto.area.slice(0,2)}-${maquinalgt.length+1}`;
  
      const nuevoCodigo =  this.codigoRepository.create({ cod: newCod, area: { id: searchArea.id } });
      await this.codigoRepository.save(nuevoCodigo);

  
      const nuevaMaquina =  this.maquinaRepository.create({ nombre: createMaquinaDto.maquina, codigo: { id: nuevoCodigo.id } });
      await this.maquinaRepository.save(nuevaMaquina);
  
      return { msj: "Maquina creada!" }
    }
  
    async findAll() {
  
      const areas = await this.areaRepository.find({ select: ['nombre'] });
      return areas;
    }
  
    async findAllCodbyArea(areaDto: AreaDto) {
  
      const areaid = await this.areaRepository.findOne({ where: { nombre: areaDto.area } });
  
      if (!areaid) {
        return { msj: "No existe esa area" }
      }
  
      const searchCodigos = await this.codigoRepository.find({
        where: {
          area: { id: areaid.id }
        },
        select: ['cod']
      });
  
      return searchCodigos;
  
    }
  
    async findAllMaquinasByCod(maquinaDto: MaquinaDto) {
  
      const codid = await this.codigoRepository.findOne({ where: { cod: maquinaDto.codigo } });
      if (!codid) {
        return { msj: "No existe ese codigo" }
      }
  
      console.log(maquinaDto.codigo, codid);
  
      const searchMaquinas = await this.maquinaRepository.find({
        where: {
          codigo: { id: codid.id }
        }, select: ['nombre']
      });
  
  
      return searchMaquinas;
    }
  
    async createCategoria(createCategoriaDto: CreateCategoriaDto) {
  
      const newCategoria =  this.categoriaRepository.create(createCategoriaDto);
      await this.categoriaRepository.save(newCategoria);
      return { msj: "Categoria creada!" }
    }

    async createTipoTrabajo(createTipoTrabajoDto:CreateTipoTrabajoDto){
   
    
    const newTipoTrabajo =  this.tipoTrabajoRepository.create({tipo:createTipoTrabajoDto.tipo});
    await this.tipoTrabajoRepository.save(newTipoTrabajo);

    return {msj:"Tipo de trabajo registrado!"}
    }
    async findAllCategorias() {
      const categorias = await this.categoriaRepository.find({ select: ['nombre'] });
      return categorias;
    }
  
    async createCargo(createCargoDto:CreateCargoDto){
    
    const newCargo =  this.cargoRepository.create({name:createCargoDto.cargo,rolId:{id:createCargoDto.rol}});
    await this.cargoRepository.save(newCargo);

    return {msj:"Nuevo cargo registrado!"}
    }


  async createToken(createAuthDto: CreateAuthDto,response:Response) {
    
    const login = await this.userRepository.findOne({where:{email:createAuthDto.email},relations:['cargoId']});
    const rol = await this.roleRepository.findOne({where:{cargo:{id:login?.cargoId.id}}});

    if(!login){
      
    return new NotFoundException("Usuario no valido");
    }

    if(!rol){
      
    return new NotFoundException("Rol no valido");
    }

    const validatePassword = await bcrypt.compare(createAuthDto.password,login.password);
  
    if(validatePassword == false){
       return new NotFoundException("Contraseña incorrecta");
    }

    console.log("login",login);
    const token = this.jwtService.sign({id:login.id,rol:rol.id,rolName:rol.role});

    response.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:'none',
      maxAge:3600*1000
    });

    return {msj:"Bienvenido",access:true};
  }

  async logout(response:Response){
  
    response.clearCookie("token",{
      httpOnly:true,
      secure:true,
      sameSite:'none'
    });

    response.send({
      msj:"Sesion terminada"
    });
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
