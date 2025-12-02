import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Inventario } from './entities/inventario.entity';
import { CreateItemsSolicitadosDto } from './dto/create-items-solicitados.dto';
import { ItemsSolicitados } from './entities/itemsSolicitados.entity';
import { SolicitudDeCompra } from 'src/solicitud-de-compra/entities/solicitud-de-compra.entity';

@Injectable()
export class InventarioService {

  constructor(@InjectRepository(Inventario) private readonly inventarioRepository:Repository<Inventario>,
              @InjectRepository(ItemsSolicitados) private readonly itemsSolicitadosRepository:Repository<ItemsSolicitados>,
              @InjectRepository(SolicitudDeCompra) private readonly solicitudDeComprasRepository:Repository<SolicitudDeCompra>,){}

  create(createInventarioDto: CreateInventarioDto) {
    return 'This action adds a new inventario';
  }

  async createItemsSolicitados(createItemsSolicitadosDto: CreateItemsSolicitadosDto) {
console.log("llego al servicio de inventario para items solicitados");
console.log(createItemsSolicitadosDto);
try {
    const ordenCompra = await this.solicitudDeComprasRepository.findOne({where:{numOrdenTrabajo:{id:createItemsSolicitadosDto.ordenTrabajoId}}});

    if(!ordenCompra){
      return {msj:"No se encontro una orden de compra asociada a la orden de trabajo"};
    }

    const findItem = await this.inventarioRepository.findOne({where:{nombre:createItemsSolicitadosDto.item}});

    if(!findItem){

      const newItemSolicitado = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:createItemsSolicitadosDto.cantidad, 
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:false
      });
      await this.itemsSolicitadosRepository.save(newItemSolicitado);
      return {msj:"El item no se encuentra en el inventario"};
    }

     if(findItem){
      if(findItem.stock>=createItemsSolicitadosDto.cantidad){
        const newItemSolicitado = this.itemsSolicitadosRepository.create({
          item:createItemsSolicitadosDto.item,
          cantidad:createItemsSolicitadosDto.cantidad,
          caracteristica:createItemsSolicitadosDto.caracteristica,
          Observacion:createItemsSolicitadosDto.Observacion,
          ordenCompra:ordenCompra,
          existencia:true
        });
        await this.itemsSolicitadosRepository.save(newItemSolicitado);
        return {msj:"Item registrado con existencia en inventario"};
      }

      if(findItem.stock<createItemsSolicitadosDto.cantidad){

      const newItemConStock = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:findItem.stock,
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:true
      });
      await this.itemsSolicitadosRepository.save(newItemConStock);

      const stockNosuficiente = createItemsSolicitadosDto.cantidad - findItem.stock;
      const newItemNoStock = this.itemsSolicitadosRepository.create({
        item:createItemsSolicitadosDto.item,
        cantidad:stockNosuficiente,
        caracteristica:createItemsSolicitadosDto.caracteristica,
        Observacion:createItemsSolicitadosDto.Observacion,
        ordenCompra:ordenCompra,
        existencia:false
      });

      await this.itemsSolicitadosRepository.save(newItemNoStock);
      return {msj:"Item registrado con existencia en inventario"};
    }
    
  }
} catch (error) {
    console.log(error);
    return {msj:"Error al registrar el item solicitado"};
}
  
}

  async findAll() {

    const inventarios = await this.inventarioRepository.find({select:['id','nombre','stock']});
    if(!inventarios){
      return new NotFoundException("No se encontro inventarios");
    }
    return inventarios;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventario`;
  }

 async filtrarInventario(item: string) {

    const inventario = await this.inventarioRepository.find({where:{nombre:Like(`${item}%`)},select:['nombre']});

    return inventario;
  }

  update(id: number, updateInventarioDto: UpdateInventarioDto) {
    return `This action updates a #${id} inventario`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventario`;
  }
}
