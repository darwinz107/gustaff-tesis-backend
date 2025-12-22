// dashboard.service.ts (fragmentos)
import { Injectable } from '@nestjs/common';
import { EstadoTrabajoEnum } from 'src/orden-de-trabajo/enums/estado-trabajo.enum';
import { EstadoCompraEnum } from 'src/solicitud-de-compra/enums/estadoCompra.enum';
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


}
