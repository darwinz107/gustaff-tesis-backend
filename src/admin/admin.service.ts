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
import { DataSource, Repository } from 'typeorm';
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
    private dataSource:DataSource,
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
        return {msj:'Correo ya registrado',validate:false};
        
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
        const categorias = await this.categoriaRepository.find();
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
      
      const getCargos = await this.cargoRepository.find({relations:['rolId']});

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

async deleteUser(id: number) {

  console.log("Eliminar usuario id:", id);


  const ordenTrabajoUser = await this.userRepository.find({where:{id},relations:['ordenesTrabajo']});

  if(ordenTrabajoUser && ordenTrabajoUser.length >0){
    return {msj:"No se puede eliminar el usuario porque tiene ordenes de trabajo asociadas",validate:false};
  }

  const userdelete = await this.userRepository.delete(id);

  if(userdelete.affected ===0) return {msj:"No se encontro un usuario valido",validate:false};

  return {msj:"Se elimino correctamente",validate:true};


}

async getAllInfoAreas(){
  const areas = await this.areaRepository.find({
    relations:['codigo','codigo.maquina'],
  });
  return areas;
}

async getAllBodegas(){
  const bodegas = await this.bodegaRepository.createQueryBuilder('bodega')
  .leftJoinAndSelect('bodega.seccion', 'seccion')
  .leftJoinAndSelect('seccion.percha', 'percha')
  .orderBy('bodega.bodega', 'ASC')
  .addOrderBy('seccion.seccion', 'ASC')
  .addOrderBy('percha.percha', 'ASC')
  .getMany();
  return bodegas;
}
 

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async editArea(id:number,area:string){
    const areaEdit = await this.areaRepository.findOne({where:{id}});   
    if(!areaEdit){
      return {msj:"No se encontro un area valida",validate:false};
    }
    console.log(area);
    areaEdit.nombre = area;
    await this.areaRepository.save(areaEdit);
    return {msj:"Area editada correctamente",validate:true};
  }

  async editBodega(id:number,bodega:string){
    console.log("Editar bodega id:", id, " Bodega:", bodega);
    const bodegaEdit = await this.bodegaRepository.findOne({where:{id}});
    if(!bodegaEdit){
      return {msj:"No se encontro una bodega valida",validate:false};
    }
    bodegaEdit.bodega = bodega;
    await this.bodegaRepository.save(bodegaEdit);
    return {msj:"Bodega editada correctamente",validate:true};
  }
  
  async deleteArea(id:number){  
    const findCodigo = await this.codigoRepository.find({where:{area:{id}}});
    if(findCodigo.length > 0){
      return {msj:"No se puede eliminar el area porque tiene codigos asociados",validate:false};
    }
    const areaDelete = await this.areaRepository.delete(id);   
    if(areaDelete.affected ===0){
      return {msj:"No se encontro un area valida",validate:false};
    }
    return {msj:"Area eliminada correctamente",validate:true};
  }

  async deleteBodega(id:number){

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log("Eliminar bodega id:", id);
      const findSecciones = await queryRunner.manager.find(Seccion,{where:{bodega:{id}}});
      if(findSecciones.length > 0){
       for(const seccion of findSecciones){
        const findPerchas = await queryRunner.manager.find(Percha,{where:{seccion:{id:seccion.id}}});
        if(findPerchas.length > 0){
          for(const percha of findPerchas){
            const perchaDelete = await queryRunner.manager.delete(Percha,percha.id);
            if(perchaDelete.affected ===0){
              await queryRunner.rollbackTransaction();
              return {msj:"No se pudo eliminar la bodega, intente de nuevo",validate:false};
            }
          }
          
      }
        const seccionDelete = await queryRunner.manager.delete(Seccion,seccion.id);
        if(seccionDelete.affected ===0){
          await queryRunner.rollbackTransaction();
          return {msj:"No se pudo eliminar la bodega, intente de nuevo",validate:false};
        }
        }
      }
      const bodegaDelete = await queryRunner.manager.delete(Bodega,id);
      if(bodegaDelete.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una bodega valida",validate:false};
      }
      await queryRunner.commitTransaction();
      return {msj:"Bodega eliminada correctamente",validate:true};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error eliminando bodega:', error);
      return { msj: 'Error al eliminar bodega', validate: false, error: error?.message ?? error };
    }
    finally {
      await queryRunner.release();
    }


   /* const findSecciones = await this.seccionRepository.find({where:{bodega:{id}}});
    if(findSecciones.length > 0){
      
    }
    const bodegaDelete = await this.bodegaRepository.delete(id);
    if(bodegaDelete.affected ===0){
      return {msj:"No se encontro una bodega valida",validate:false};
    }
    return {msj:"Bodega eliminada correctamente",validate:true};*/
  }

  async editMaquina(id:number,area:string, maquina:string){
    console.log("Editar maquina id:", id, " Area:", area);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const maquinaEdit = await queryRunner.manager.findOne(Maquina, {where:{id},relations:['codigo']});   
      if(!maquinaEdit){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una maquina valida",validate:false};
      }

      maquinaEdit.nombre = maquina;

     const findAreaa = await queryRunner.manager.findOne(Area,{where:{codigo:{id:maquinaEdit.codigo.id}}});

     if(!findAreaa){
      await queryRunner.rollbackTransaction();
      return {msj:"No se encontro un area valida para la maquina",validate:false};
     }

     if(area === findAreaa.nombre){
        await queryRunner.manager.save(maquinaEdit);
        await queryRunner.commitTransaction();
        return {msj:"Maquina editada correctamente",validate:true};
      }

      const findArea = await queryRunner.manager.findOne(Area,{where:{nombre:area}});
      if(!findArea){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro un area valida para la maquina",validate:false};
      }
      const findCodigo = await queryRunner.manager.findOne(Codigo,{where:{id:maquinaEdit.codigo.id}});
      if(!findCodigo){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro un codigo valido para la maquina",validate:false};
      }
      const deleteMaquina = await queryRunner.manager.delete(Maquina,maquinaEdit.id);
      if(deleteMaquina.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
      }
      const deleteCodigo = await queryRunner.manager.delete(Codigo,findCodigo.id);
      if(deleteCodigo.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
      }
      const lastCodId = await queryRunner.manager.findOne(Codigo,{where:{area:{id:findArea.id}}, order:{id:"DESC"}});
      if(!lastCodId){
        await queryRunner.rollbackTransaction();
        return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
      }
      const newCod =  `GU-${maquinaEdit.nombre.slice(0,3)}-${lastCodId.id+1}`;
      const nuevoCodigo =  queryRunner.manager.create(Codigo, { cod: newCod, area: { id: findArea.id } });
      await queryRunner.manager.save(nuevoCodigo);
      await queryRunner.manager.save(Maquina,{...maquinaEdit,codigo:{id:nuevoCodigo.id}});
      await queryRunner.commitTransaction();
      return {msj:"Maquina editada correctamente",validate:true};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error editando maquina:', error);
      return { msj: 'Error al editar maquina', validate: false, error: error?.message ?? error };
    }
    finally {
      await queryRunner.release();
    }


  /*  const maquinaEdit = await this.maquinaRepository.findOne({where:{id},relations:['codigo']});   
    if(!maquinaEdit){
      return {msj:"No se encontro una maquina valida",validate:false};
    }

    const findArea = await this.areaRepository.findOne({where:{nombre:area}});
    if(!findArea){
      return {msj:"No se encontro un area valida para la maquina",validate:false};
    }
    
    const findCodigo = await this.codigoRepository.findOne({where:{id:maquinaEdit.codigo.id}});
    if(!findCodigo){
      return {msj:"No se encontro un codigo valido para la maquina",validate:false};
    }

    const deleteMaquina = await this.maquinaRepository.delete(maquinaEdit.id);
    if(deleteMaquina.affected ===0){
      return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
    }

    const deleteCodigo = await this.codigoRepository.delete(findCodigo.id);
    if(deleteCodigo.affected ===0){
      return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
    }
    
   const lastCodId = await this.codigoRepository.findOne({where:{area:{id:findArea.id}}, order:{id:"DESC"}});
   if(!lastCodId){
    return {msj:"No se pudo actualizar la maquina, intente de nuevo",validate:false};
   }
    const newCod =  `GU-${maquinaEdit.nombre.slice(0,3)}-${lastCodId.id+1}`;
    const nuevoCodigo =  this.codigoRepository.create({ cod: newCod, area: { id: findArea.id } });
    await this.codigoRepository.save(nuevoCodigo);

    await this.maquinaRepository.save({...maquinaEdit,codigo:{id:nuevoCodigo.id}});

    return {msj:"Maquina editada correctamente",validate:true

  };*/ };

  async editSeccion(id:number,seccion:string,bodega:string){
   console.log("Editar seccion id:", id, " Seccion:", seccion, " Bodega:", bodega);
   const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const seccionEdit = await queryRunner.manager.findOne(Seccion,{where:{id},relations:['bodega']});
      if(!seccionEdit){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una seccion valida",validate:false};
      }
      const bodegaFind = await queryRunner.manager.findOne(Bodega,{where:{bodega}});
      if(!bodegaFind){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una bodega valida",validate:false};
      }
      
      if(seccionEdit.bodega.id === bodegaFind.id){
        seccionEdit.seccion = seccion;
        await queryRunner.manager.save(seccionEdit);
        await queryRunner.commitTransaction();
        console.log(bodegaFind);
        console.log("Seccion editada correctamente");
        return {msj:"Seccion editada correctamente",validate:true};
      }

      seccionEdit.seccion = seccion;
      seccionEdit.bodega = bodegaFind;
      await queryRunner.manager.save(seccionEdit);
      await queryRunner.commitTransaction();
      return {msj:"Seccion editada correctamente",validate:true};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error editando seccion:', error);
      return { msj: 'Error al editar seccion', validate: false, error: error?.message ?? error };
    
    } finally {
      await queryRunner.release();
    }
  }

  async editPercha(id:number,percha:string,seccion:string){
   console.log("Editar percha id:", id, " Percha:", percha, " Seccion:", seccion);
   const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const perchaEdit = await queryRunner.manager.findOne(Percha,{where:{id},relations:['seccion']});
      if(!perchaEdit){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una percha valida",validate:false};
      }
      const seccionFind = await queryRunner.manager.findOne(Seccion,{where:{seccion}});
      if(!seccionFind){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una seccion valida",validate:false};
      }
      if(perchaEdit.seccion.id === seccionFind.id){
        perchaEdit.percha = percha;
        await queryRunner.manager.save(perchaEdit);
        await queryRunner.commitTransaction();
        return {msj:"Percha editada correctamente",validate:true};
      }
      perchaEdit.percha = percha;
      perchaEdit.seccion = seccionFind;
      await queryRunner.manager.save(perchaEdit);
      await queryRunner.commitTransaction();
      return {msj:"Percha editada correctamente",validate:true};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error editando percha:', error);
      return { msj: 'Error al editar percha', validate: false, error: error?.message ?? error };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMaquina(id:number){ 

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log("Eliminar maquina id:", id);
      const maquinaDelete = await queryRunner.manager.findOne(Maquina, {where:{id},relations:['codigo']});
      if(!maquinaDelete){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una maquina valida",validate:false};
      }
      const deleteMaquina = await queryRunner.manager.delete(Maquina,maquinaDelete.id);
      if(deleteMaquina.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se pudo eliminar la maquina, intente de nuevo",validate:false};
      }
      const deleteCodigo = await queryRunner.manager.delete(Codigo,maquinaDelete.codigo.id);
      if(deleteCodigo.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se pudo eliminar la maquina, intente de nuevo",validate:false};
      }
      await queryRunner.commitTransaction();
      return {msj:"Maquina eliminada correctamente",validate:true};
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error eliminando maquina:', error);
      return { msj: 'Error al eliminar maquina', validate: false, error: error?.message ?? error };
    }
    finally {
      await queryRunner.release();
    }


  /*  console.log("Eliminar maquina id:", id); 
    const maquinaDelete = await this.maquinaRepository.findOne({where:{id}});
    if(!maquinaDelete){
      return {msj:"No se encontro una maquina valida",validate:false};
    }
    const deleteMaquina = await this.maquinaRepository.delete(maquinaDelete.id);
    if(deleteMaquina.affected ===0){
      return {msj:"No se pudo eliminar la maquina, intente de nuevo",validate:false};
    }

    const deleteCodigo = await this.codigoRepository.delete(maquinaDelete.codigo.id);
    if(deleteCodigo.affected ===0){
      return {msj:"No se pudo eliminar la maquina, intente de nuevo",validate:false};
    }
    return {msj:"Maquina eliminada correctamente",validate:true};*/
  }

  async deleteSeccion(id:number){

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log("Eliminar seccion id:", id);
      const findPerchas = await queryRunner.manager.find(Percha,{where:{seccion:{id}}});
      if(findPerchas.length > 0){
        for(const percha of findPerchas){
          const perchaDelete = await queryRunner.manager.delete(Percha,percha.id);
          if(perchaDelete.affected ===0){
            await queryRunner.rollbackTransaction();
            return {msj:"No se pudo eliminar la seccion, intente de nuevo",validate:false};
          }
        }
    }
      const seccionDelete = await queryRunner.manager.delete(Seccion,id);
      if(seccionDelete.affected ===0){
        await queryRunner.rollbackTransaction();
        return {msj:"No se encontro una seccion valida",validate:false};
      }
      await queryRunner.commitTransaction();
      return {msj:"Seccion eliminada correctamente",validate:true};
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error eliminando seccion:', error);
      return { msj: 'Error al eliminar seccion', validate: false, error: error?.message ?? error };
    }
    finally {
      await queryRunner.release();
    }

  }

  async deletePercha(id:number){
  
    console.log("Eliminar percha id:", id);
    const perchaDelete = await this.perchaRepository.delete(id);
    if(perchaDelete.affected ===0){
      return {msj:"No se encontro una percha valida",validate:false};
    }
    return {msj:"Percha eliminada correctamente",validate:true};
  }

  async editCategoria(id:number,categoria:string){
    console.log("Editar categoria id:", id, " Categoria:", categoria);
    const categoriaEdit = await this.categoriaRepository.findOne({where:{id}});
    if(!categoriaEdit){
      return {msj:"No se encontro una categoria valida",validate:false};
    }
    categoriaEdit.nombre = categoria;
    await this.categoriaRepository.save(categoriaEdit);
    return {msj:"Categoria editada correctamente",validate:true};
  }

  async deleteCategoria(id:number){
    const categoriaDelete = await this.categoriaRepository.delete(id);
    if(categoriaDelete.affected ===0){
      return {msj:"No se encontro una categoria valida",validate:false};
    }
    return {msj:"Categoria eliminada correctamente",validate:true};
  }

  async edittipoTrabajo(id:number,tipo:string){
    console.log("Editar tipo de trabajo id:", id, " Tipo de trabajo:", tipo); 
    const tipoTrabajoEdit = await this.tipoTrabajoRepository.findOne({where:{id}});
    if(!tipoTrabajoEdit){
      return {msj:"No se encontro un tipo de trabajo valido",validate:false};
    }
    tipoTrabajoEdit.tipo = tipo;
    await this.tipoTrabajoRepository.save(tipoTrabajoEdit);
    return {msj:"Tipo de trabajo editado correctamente",validate:true};
  }

  async deleteTipoTrabajo(id:number){
    const tipoTrabajoDelete = await this.tipoTrabajoRepository.delete(id);
    if(tipoTrabajoDelete.affected ===0){
      return {msj:"No se encontro un tipo de trabajo valido",validate:false};
    }
    return {msj:"Tipo de trabajo eliminado correctamente",validate:true};
  }

  async editCargo(id:number,cargo:string,rol:number){
    const cargoEdit = await this.cargoRepository.findOne({where:{id},relations:['rolId']});
    if(!cargoEdit){
      return {msj:"No se encontro un cargo valido",validate:false};
    }
    if(rol){
      const rolFind = await this.roleRepository.findOne({where:{id:rol}});
      if(!rolFind){
        return {msj:"No se encontro un rol valido",validate:false};
      }
      cargoEdit.rolId = rolFind;
    }
    cargoEdit.name = cargo;
    await this.cargoRepository.save(cargoEdit);
    return {msj:"Cargo editado correctamente",validate:true};
  }
  async deleteCargo(id:number){
    const cargoDelete = await this.cargoRepository.delete(id);
    if(cargoDelete.affected ===0){
      return {msj:"No se encontro un cargo valido",validate:false};
    }
    return {msj:"Cargo eliminado correctamente",validate:true};
  }

  async getAllTiposTrabajo():Promise<TipoTrabajo[]>{
    const tiposTrabajo = await this.tipoTrabajoRepository.find();
    if(!tiposTrabajo){
      throw new NotFoundException('No se encontraron tipos de trabajo');
    }
    return tiposTrabajo;
  }

}