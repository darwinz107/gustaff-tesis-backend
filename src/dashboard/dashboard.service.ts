// dashboard.service.ts (fragmentos)
import { Injectable } from '@nestjs/common';
import { EstadoTrabajoEnum } from 'src/orden-de-trabajo/enums/estado-trabajo.enum';
import { EstadoCompraEnum } from 'src/solicitud-de-compra/enums/estadoCompra.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

  // KPIs
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

    const solicitudesPendientes = await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .innerJoin('s.estadoCompra', 'e')
      .where('e.estado = :estado', { estado: EstadoCompraEnum.ENT })
      .getCount();

    // solicitudes completas (todos items existencia = true)
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
      solicitudesPendientes,
      solicitudesCompletas: completas,
    };
  }

  // Ordenes por estado (raw para evitar ciclos)
  async getOrdenesPorEstado() {
    const data = await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.estadoTrabajo', 'estado')
      .select('estado.estado', 'estado')
      .addSelect('COUNT(o.id)', 'count')
      .groupBy('estado.estado')
      .getRawMany();
    // devuelve [{estado: 'PROC', count: '10'}, ...]
    return data.map(d => ({ estado: d.estado, count: Number(d.count) }));
  }

  // Solicitudes por dia (últimos N días)
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

  // Ultimas ordenes (campos limitados)
  async getUltimasOrdenes(limit = 5) {
    return await this.dataSource
      .getRepository('SolicitudOrden')
      .createQueryBuilder('o')
      .innerJoin('o.userSolicitante', 'u')
      .innerJoin('o.estadoTrabajo', 'estado')
      .select([
        'o.id AS id',
        'o.NumOrden AS numOrden',
        'o.fechaInicio AS fechaInicio',
        'o.fechaFinal AS fechaFinal',
        'u.name AS solicitante',
        'estado.estado AS estado'
      ])
      .orderBy('o.id', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Ultimas solicitudes de material
  async getUltimasSolicitudes(limit = 5) {
    return await this.dataSource
      .getRepository('SolicitudDeCompra')
      .createQueryBuilder('s')
      .innerJoin('s.numOrdenTrabajo', 'o')
      .innerJoin('o.userSolicitante', 'u')
      .select([
        's.id AS id',
        's.numOrden AS numOrden',
        's.fechaRemision AS fechaRemision',
        's.Destino AS destino',
        'u.name AS solicitante'
      ])
      .orderBy('s.id', 'DESC')
      .limit(limit)
      .getRawMany();
  };
}
