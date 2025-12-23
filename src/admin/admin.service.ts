import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Area } from 'src/parametro/entities/area.entity';
import { Categoria } from 'src/parametro/entities/categoria.entity';
import { Codigo } from 'src/parametro/entities/codigo.entity';
import { Maquina } from 'src/parametro/entities/maquina.entity';
import { TipoTrabajo } from 'src/parametro/entities/tipoTrabajo.entity';
import { Role } from 'src/roles/entities/role.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Cargo } from 'src/users/entities/cargo.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AreaDto } from './dto/area.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { CreateTipoTrabajoDto } from './dto/create-tipo-trabajo.dto';
import { MaquinaDto } from './dto/maquina.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Bodega } from 'src/parametro/entities/bodega';
import { Seccion } from 'src/parametro/entities/seccion';
import { Percha } from 'src/parametro/entities/percha';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CreatePerchaDto } from './dto/create-percha.dto';


@Injectable()
export class AdminService implements OnModuleInit{
  
   constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
    @InjectRepository(Area) private readonly areaRepository:Repository<Area>,
    @InjectRepository(Categoria) private readonly categoriaRepository:Repository<Categoria>,
    @InjectRepository(Codigo) private readonly codigoRepository:Repository<Codigo>,
    @InjectRepository(Maquina) private readonly maquinaRepository:Repository<Maquina>,
    @InjectRepository(TipoTrabajo) private readonly tipoTrabajoRepository:Repository<TipoTrabajo>, 
    @InjectRepository(Cargo) private readonly cargoRepository:Repository<Cargo>, 
    @InjectRepository(Role) private readonly roleRepository:Repository<Role>, 
     @InjectRepository(Bodega)
    private readonly bodegaRepository: Repository<Bodega>,
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
    @InjectRepository(Percha)
    private readonly perchaRepository: Repository<Percha>,
  ){}
    async onModuleInit() {
      const searchUsers = await this.userRepository.find();
     if(searchUsers.length == 0){
        const newCargo = this.cargoRepository.create({name:"Jefe administrador",rolId:{id:1}});
        await this.cargoRepository.save(newCargo);

        const passHashed =await bcrypt.hash("admin",10);
        const admin = this.userRepository.create({name:"admin",cellphone:"0989582358",email:"admin@gmail.com",password:passHashed,cargoId:{id:newCargo.id}});
        await this.userRepository.save(admin);
     }
    }
  
    async createUser(createUserDto: CreateUserDto) {
      try {
        
        const cargo = await this.cargoRepository.findOne({where:{id:createUserDto.cargo}});
  
      const user = await this.userRepository.findOne({where:{email:createUserDto.email}});
  
      if(user){
        return {msj:'Correo ya registrado'};
        
      }
  
      if(!cargo){
        
      return new NotFoundException("cargo");
      }
      console.log(createUserDto.email);
      console.log("contra al crear");
    console.log(createUserDto.password);
      const passHashed = await bcrypt.hash(createUserDto.password,10);
       console.log(passHashed);
      createUserDto.password = passHashed;
   
      const createUser = this.userRepository.create(createUserDto);
      createUser.cargoId = cargo;
      await this.userRepository.save(createUser);
      return {msj:'Usuario creado!',validate:true};
      } catch (error) {
        console.log(error);
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
    
        const newCod =  `GU-${createMaquinaDto.maquina.slice(0,3)}-${maquinalgt.length+1}`;
    
        const nuevoCodigo =  this.codigoRepository.create({ cod: newCod, area: { id: searchArea.id } });
        await this.codigoRepository.save(nuevoCodigo);
  
    
        const nuevaMaquina =  this.maquinaRepository.create({ nombre: createMaquinaDto.maquina, codigo: { id: nuevoCodigo.id } });
        await this.maquinaRepository.save(nuevaMaquina);
    
        return { msj: "Maquina creada!" }
      }
    
      async findAll() {
    
        const areas = await this.areaRepository.find({ select: ['id','nombre'] });
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
         
         return []
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
     
      
      const newTipoTrabajo =  this.tipoTrabajoRepository.create(createTipoTrabajoDto);
      await this.tipoTrabajoRepository.save(newTipoTrabajo);
  
      return {msj:"Tipo de trabajo registrado!"}
      }
      async findAllCategorias() {
        const categorias = await this.categoriaRepository.find({ select: ['nombre'] });
        return categorias;
      }
    
      async createCargo(createCargoDto:CreateCargoDto){
      if(!createCargoDto.rol){
        const newCargo =  this.cargoRepository.create({name:createCargoDto.cargo,rolId:null});
      await this.cargoRepository.save(newCargo);
      return {msj:"Nuevo cargo registrado!"}
      }
      const newCargo =  this.cargoRepository.create({name:createCargoDto.cargo,rolId:{id:createCargoDto.rol}});
      await this.cargoRepository.save(newCargo);
  
      return {msj:"Nuevo cargo registrado!"}
      }
  
   async allroles(){
      
      const getRoles = await this.roleRepository.find({select:['id','role']});

      return getRoles;
      }

    async allCargos(){
      
      const getCargos = await this.cargoRepository.find({select:['id','name']});

      return getCargos;
      }  

  async update(id: number, updateUserDto: UpdateUserDto) {
  try {
    console.log(updateUserDto)
    const user = await this.userRepository.findOne({ where: { id }, relations: ['cargoId'] });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    
    if (updateUserDto.cargo !== undefined && updateUserDto.cargo !== null) {
      const cargo = await this.cargoRepository.findOne({ where: { id: updateUserDto.cargo } });
      if (!cargo) {
        throw new NotFoundException('Cargo no encontrado');
      }
      user.cargoId = cargo;
    }

    
    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.identification !== undefined) user.identification = updateUserDto.identification;
    if (updateUserDto.cellphone !== undefined) user.cellphone = updateUserDto.cellphone;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;

    
    if (updateUserDto.fechaNac !== undefined && updateUserDto.fechaNac !== null) {
      const f = updateUserDto.fechaNac;
      
      if (typeof f === 'string') {
        user.fechaNac = new Date(f); 
      } else {
        user.fechaNac = f as Date;
      }
    }
   console.log("Contra al editar")
   console.log(updateUserDto)
   
    if (updateUserDto.password !== undefined && updateUserDto.password !== null && updateUserDto.password !== '') {
      const passHashed = await bcrypt.hash(updateUserDto.password, 10);
      user.password = passHashed;
    }

    
    await this.userRepository.save(user);

    return { msj: `Se actualizó la información de ${user.name}`, validate: true };
  } catch (error) {
   
    if (error instanceof NotFoundException) throw error;
    console.error('Error actualizando usuario:', error);
    return { msj: 'Error al actualizar usuario', validate: false, error: error?.message ?? error };
  }
}

  
  async findAllTipoTrabajo(){
    const allTipoTrabajo = await this.tipoTrabajoRepository.find({select:['tipo']});
    return allTipoTrabajo;
  }

   async createBodega(createBodegaDto: CreateBodegaDto): Promise<{ok:boolean,message:string}> {
    
    const bodega = this.bodegaRepository.create({ bodega:createBodegaDto.bodega });
      await this.bodegaRepository.save(bodega);

  return {
    ok: true,
    message: 'Bodega creada correctamente',
  };
  }

  async createSeccion(createSeccionDto: CreateSeccionDto): Promise<{ok:boolean,message:string}> {
   
    const bodega = await this.bodegaRepository.findOne({ where: { id: createSeccionDto.bodegaId } });
    if (!bodega) throw new NotFoundException('Bodega no encontrada');

    const seccion = this.seccionRepository.create({
      seccion :createSeccionDto.seccion,
       bodega, 
    });
      await this.seccionRepository.save(seccion);

  return {
    ok: true,
    message: 'Sección creada correctamente',
  };
  }

  async createPercha(createPerchaDto: CreatePerchaDto): Promise<{ok:boolean,message:string}> {
    const { percha, seccionId } = createPerchaDto;

    const seccion = await this.seccionRepository.findOne({ where: { id: seccionId } });
    if (!seccion) throw new NotFoundException('Sección no encontrada');

   

      const crearPercha = this.perchaRepository.create({
    percha: createPerchaDto.percha,
    seccion,
  });

 await this.perchaRepository.save(crearPercha);
  return {
    ok: true,
    message: 'Percha creada correctamente',
  };
  }

  async findAllSecciones(): Promise<{ id: number; seccion: string }[]> {
  return await this.seccionRepository.find({
    select: ['id', 'seccion'],
    order: { seccion: 'ASC' },
  });
}

async findAllBodegas(): Promise<{ id: number; bodega: string }[]> {
  return await this.bodegaRepository.find({
    select: ['id', 'bodega'],
    order: { bodega: 'ASC' },
  });
}




 

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
