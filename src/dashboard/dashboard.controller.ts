
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('kpis')
  getKPIs() { return this.svc.getKPIs(); }

  @Get('solicitudes')
  getSolicitudes() { return this.svc.getSolicitudes(); }

  @Get('ordenes-por-estado')
  getOrdenesPorEstado() { return this.svc.getOrdenesPorEstado(); }

  @Get('solicitudes-por-dia')
  getSolicitudesPorDia(@Query('days') days?: string) {
    return this.svc.getSolicitudesPorDia(Number(days) || 30);
  }

  @Get('ultimas-ordenes')
  getUltimasOrdenes(@Query('limit') limit?: string) { return this.svc.getUltimasOrdenes(Number(limit) || 7); }

  @Get('ultimas-solicitudes')
  getUltimasSolicitudes(@Query('limit') limit?: string) { return this.svc.getUltimasSolicitudes(Number(limit) || 7); }

  @Get('entradas-por-dia')
  getActaEntradaPorDia(@Query('days') days?: string) {
    return this.svc.getActaEntradaPorDia(Number(days) || 30);
  }

  @Get('salidas-por-dia')
  getActaSalidaPorDia(@Query('days') days?: string) {
    return this.svc.getActaSalidaPorDia(Number(days) || 30);
  }

  @Get('logistica')
  getTotalStock() {
    return this.svc.getLogistica();
  }

  @Get('kpis/admin')
  getAdminKPIs() {
    return this.svc.getAdminKPIs();
  }

  @Get('users-by-cargo')
  getUsersByCargo() {
    return this.svc.getUsersByCargo();
  }

  @Get('maquinas-por-area')
  getMaquinasPorArea() {
    return this.svc.getMaquinasPorArea();
  }

  @Get('ultimos-usuarios')
  getUltimosUsuarios(@Query('limit') limit = '5') {
    return this.svc.getUltimosUsuarios(Number(limit));
  }

  @Get('actas-entrada-mes')
  getActasEntradaMesActual() {
    return this.svc.getActasEntradaMesActual();
  }

  @Get('actas-salida-mes')
  getActasSalidaMesActual() {
    return this.svc.getActasSalidaMesActual();
  }

}
