// dashboard.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('kpis')
  getKPIs() { return this.svc.getKPIs(); }

  @Get('ordenes-por-estado')
  getOrdenesPorEstado() { return this.svc.getOrdenesPorEstado(); }

  @Get('solicitudes-por-dia')
  getSolicitudesPorDia(@Query('days') days?: string) {
    return this.svc.getSolicitudesPorDia(Number(days) || 30);
  }

  @Get('ultimas-ordenes')
  getUltimasOrdenes(@Query('limit') limit?: string) { return this.svc.getUltimasOrdenes(Number(limit) || 5); }

  @Get('ultimas-solicitudes')
  getUltimasSolicitudes(@Query('limit') limit?: string) { return this.svc.getUltimasSolicitudes(Number(limit) || 5); }
}
