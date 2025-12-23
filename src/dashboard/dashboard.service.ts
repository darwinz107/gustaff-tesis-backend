// dashboard.service.ts (fragmentos)
import { Injectable } from '@nestjs/common';
import { EstadoTrabajoEnum } from 'src/orden-de-trabajo/enums/estado-trabajo.enum';
import { Area } from 'src/parametro/entities/area.entity';
import { Bodega } from 'src/parametro/entities/bodega';
import { Categoria } from 'src/parametro/entities/categoria.entity';
import { Codigo } from 'src/parametro/entities/codigo.entity';
import { Maquina } from 'src/parametro/entities/maquina.entity';
import { Percha } from 'src/parametro/entities/percha';
import { Seccion } from 'src/parametro/entities/seccion';
import { TipoTrabajo } from 'src/parametro/entities/tipoTrabajo.entity';
import { Role } from 'src/roles/entities/role.entity';
import { EstadoCompraEnum } from 'src/solicitud-de-compra/enums/estadoCompra.enum';
import { Cargo } from 'src/users/entities/cargo.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

  
  async getKPIs() {
    const totalOrdenes = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .getCount();

    const enProceso = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.estadoTrabajo', 'estado')
      .where('estado.estado = :estado', { estado: EstadoTrabajoEnum.PROC })
      .getCount();

    const vencidas = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.estadoTrabajo', 'estado')
      .where('estado.estado = :estado', { estado: EstadoTrabajoEnum.VEN })
      .getCount();

      const finalizadas = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.estadoTrabajo', 'estado')
      .where('estado.estado = :estado', { estado: EstadoTrabajoEnum.FIN })
      .getCount();

    const solicitudesPendientes = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .innerJoin('s.estadoCompra', 'e')
      .where('e.estado = :estado', { estado: EstadoCompraEnum.ENT })
      .getCount();

    
    const solicitudes = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .leftJoin('s.itemSolicitados', 'it')
      .select('s.id')
      .addSelect('SUM(CASE WHEN it.existencia = 1 THEN 1 ELSE 0 END)', 'existencias')
      .addSelect('COUNT(it.id)', 'totalItems')
      .groupBy('s.id')
      .getRawMany();

    const completas = solicitudes.filter(r => Number(r.existencias) === Number(r.totalItems)).length;

    return {
      totalOrdenes,
      enProceso,
      vencidas,
      finalizadas
    };
  }

    async getSolicitudes() {
    const totalSol = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('o')
      .getCount();

    const enProceso = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('o')
      .innerJoin('o.estadoCompra', 'estado')
      .where('estado.estado = :estado', { estado: EstadoCompraEnum.PRO })
      .getCount();

    const parcial = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('o')
      .innerJoin('o.estadoCompra', 'e')
      .where('e.estado = :estado', { estado: EstadoCompraEnum.PAR })
      .getCount();

      const entregado = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('o')
      .innerJoin('o.estadoCompra', 'e')
      .where('e.estado = :estado', { estado: EstadoCompraEnum.ENT })
      .getCount();

   /* const solicitudesPendientes = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .innerJoin('s.estadoCompra', 'e')
      .where('e.estado = :estado', { estado: EstadoCompraEnum. })
      .getCount();*/

    
  /*  const solicitudes = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .leftJoin('s.itemSolicitados', 'it')
      .select('s.id')
      .addSelect('SUM(CASE WHEN it.existencia = 1 THEN 1 ELSE 0 END)', 'existencias')
      .addSelect('COUNT(it.id)', 'totalItems')
      .groupBy('s.id')
      .getRawMany();

    const completas = solicitudes.filter(r => Number(r.existencias) === Number(r.totalItems)).length;*/

    return {
      totalSol,
      enProceso,
      parcial,
      entregado
    };
  }

  
  async getOrdenesPorEstado() {
    const data = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.estadoTrabajo', 'estado')
      .select('estado.estado', 'estado')
      .addSelect('COUNT(o.id)', 'count')
      .groupBy('estado.estado')
      .getRawMany();
    
    return data.map(d => ({ estado: d.estado, count: Number(d.count) }));
  }

  
  async getSolicitudesPorDia(days = 30) {
    const raw = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .select("DATE(s.fechaRemision)", "date")
      .addSelect("COUNT(s.id)", "count")
      .where("s.fechaRemision >= DATE_SUB(CURDATE(), INTERVAL :days DAY)", { days })
      .groupBy("DATE(s.fechaRemision)")
      .orderBy("DATE(s.fechaRemision)", "ASC")
      .getRawMany();
    return raw.map(r => ({ date: r.date, count: Number(r.count) }));
  }

  
  async getUltimasOrdenes(limit = 5) {
    return await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.userSolicitante', 'u')
      .innerJoin('o.estadoTrabajo', 'estado')
      .select([
        'o.id AS id',
        'o.NumOrden AS numOrden',
        'o.fechaInicio',
        'o.fechaFinal ',
        'u.name AS solicitante',
        'estado.estado as estado',
        'o.DescripcionTrabajo AS descripcion'
      ])
      .orderBy('o.id', 'DESC')
      .limit(limit)
      .getRawMany();
  }

 
  async getUltimasSolicitudes(limit = 5) {
    return await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .innerJoin('s.numOrdenTrabajo', 'o')
      .innerJoin('o.userSolicitante', 'u')
      .innerJoin('s.itemSolicitados', 'is')
      .innerJoin('s.estadoCompra', 'e')
      .select([
        's.id as id',
        's.numOrden ',
        's.fechaRemision ',
        //'s.Destino AS destino',
        'u.name AS solicitante',
        'e.estado AS estado'
      ])
      .addSelect('SUM(is.cantidad)','total_items')
      .groupBy('s.id')
      .orderBy('s.id', 'DESC')
      .limit(limit)
      .getRawMany();
  };

  async getActaEntradaPorDia(days = 30) {
   
    return await this.dataSource.getRepository('RegistroEntrada')
    .createQueryBuilder('re')
    .select('DATE(re.fechaRemision)','fechaRemision')
    .addSelect('COUNT(re.id)','total')
    .where('re.fechaRemision >=DATE_SUB(CURDATE(), INTERVAL :days DAY)',{days})
    .groupBy('DATE(re.fechaRemision)')
    .orderBy('DATE(fechaRemision)','ASC')
    .getRawMany();
  }

   async getActaSalidaPorDia(days:number) {
    return await this.dataSource.getRepository('RegistroSalida')
    .createQueryBuilder('rs')
    .select('DATE(rs.fechaRemision)','fechaRemision')
    .addSelect('COUNT(rs.id)','total')
    .where('rs.fechaRemision >= DATE_SUB(CURDATE(), INTERVAL :days DAY)',{days})
    .groupBy('DATE(rs.fechaRemision)')
    .orderBy('DATE(rs.fechaRemision)','ASC')
    .getRawMany();
   }

   async getLogistica() {
      const totalStock = await this.dataSource.getRepository('Inventario')
      .createQueryBuilder('in')
      .select('SUM(in.stock)','total')
      .getRawOne();
   

const totalRegEntrada =  await this.dataSource.getRepository('RegistroEntrada')
      .createQueryBuilder('re')
      .getCount();
  

  const totalItemsEntrada =  await this.dataSource.getRepository('ItemsEntrada')
      .createQueryBuilder('ie')
      .select('SUM(ie.cantidad)','cantidad')
      .getRawOne();
  

  
 
      const totalRegSalida = await this.dataSource.getRepository('RegistroSalida')
      .createQueryBuilder('rs')
      .getCount();
  

  const totalItemsSalida =  await this.dataSource.getRepository('ItemsSalida')
      .createQueryBuilder('is')
      .select('SUM(is.cantidad)','cantidad')
      .getRawOne();
  
      return {
        totalStock,
        totalRegEntrada,
        totalItemsEntrada,
        totalRegSalida,
        totalItemsSalida
      }
}

async getAdminKPIs() {
  const totalUsers = await this.dataSource
    .getRepository(User)
    .createQueryBuilder('u')
    .getCount();

  const totalAreas = await this.dataSource
    .getRepository(Area)
    .createQueryBuilder('a')
    .getCount();

  const totalCategorias = await this.dataSource
    .getRepository(Categoria)
    .createQueryBuilder('c')
    .getCount();

  const totalMaquinas = await this.dataSource
    .getRepository(Maquina)
    .createQueryBuilder('m')
    .getCount();

  const totalTipoTrabajos = await this.dataSource
    .getRepository(TipoTrabajo)
    .createQueryBuilder('t')
    .getCount();

  const totalBodegas = await this.dataSource
    .getRepository(Bodega)
    .createQueryBuilder('b')
    .getCount();

  const totalSecciones = await this.dataSource
    .getRepository(Seccion)
    .createQueryBuilder('s')
    .getCount();

  const totalPerchas = await this.dataSource
    .getRepository(Percha)
    .createQueryBuilder('p')
    .getCount();

  const totalRoles = await this.dataSource
    .getRepository(Role)
    .createQueryBuilder('r')
    .getCount();

  const totalCargos = await this.dataSource
    .getRepository(Cargo)
    .createQueryBuilder('c')
    .getCount();

  return {
    totalUsers,
    totalAreas,
    totalCategorias,
    totalMaquinas,
    totalTipoTrabajos,
    totalBodegas,
    totalSecciones,
    totalPerchas,
    totalRoles,
    totalCargos,
  };
}

async getUsersByCargo() {
  const raw = await this.dataSource
    .getRepository(User)
    .createQueryBuilder('u')
    .innerJoin('u.cargoId', 'c')
    .select('c.name', 'cargo')
    .addSelect('COUNT(u.id)', 'count')
    .groupBy('c.name')
    .getRawMany();

  return raw.map(r => ({
    cargo: r.cargo,
    count: Number(r.count),
  }));
}

async getMaquinasPorArea() {
  const raw = await this.dataSource
    .getRepository(Maquina)
    .createQueryBuilder('m')
    .innerJoin(Codigo, 'cod', 'cod.id = m.codigoId')
    .innerJoin(Area, 'a', 'a.id = cod.areaId')
    .select('a.nombre', 'area')
    .addSelect('COUNT(m.id)', 'count')
    .groupBy('a.nombre')
    .getRawMany();

  return raw.map(r => ({
    area: r.area,
    count: Number(r.count),
  }));
}

async getUltimosUsuarios(limit = 5) {
  return await this.dataSource
    .getRepository(User)
    .createQueryBuilder('u')
    .select([
      'u.id AS id',
      'u.name AS name',
      'u.email AS email',
      'u.cellphone AS cellphone',
    ])
    .orderBy('u.id', 'DESC')
    .limit(limit)
    .getRawMany();
}


}
