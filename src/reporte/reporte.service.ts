import { Injectable } from '@nestjs/common';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReporteService {

   constructor(
     @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository:Repository<SolicitudOrden>,
   ) {}

  create(createReporteDto: CreateReporteDto) {
    return 'This action adds a new reporte';
  }

  findAll() {
    return `This action returns all reporte`;
  }

  async generarReporteOrdenTrabajo(res:Response) {
    
    const infoReporte = await this.solicitudOrdenRepository.find();
    if(infoReporte.length === 0){
      res.status(404).json({message:'No hay datos para generar el reporte'});
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Ordenes de Trabajo');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Número de Orden', key: 'numOrden', width: 20 },
      { header: 'Fecha de Inicio', key: 'fechaInicio', width: 15 },
      { header: 'Fecha Final', key: 'fechaFinal', width: 15 },
      {header: 'Hora Inicio', key: 'horaInicio', width: 15 },
      {header: 'Hora Final', key: 'horaFinal', width: 15 },
      { header: 'Área', key: 'area', width: 20 },
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Máquina', key: 'maquina', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha de Creación', key: 'fechaCreacion', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB0C4DE' },
    };
    headerRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thick' },
      right: { style: 'thin' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    infoReporte.forEach((rep)=>{
      worksheet.addRow({
        id: rep.id,
        numOrden: rep.NumOrden,
        fechaInicio: rep.fechaInicio,
        fechaFinal: rep.fechaFinal,
        horaInicio: rep.HoraInicio,
        horaFinal: rep.HoraFinal,
        area: rep.Area,
        codigo: rep.Codigo,
        maquina: rep.Maquina,
        descripcion: rep.DescripcionTrabajo,
        estado: rep.estadoTrabajo ? rep.estadoTrabajo.estado : 'N/A',
        fechaCreacion: rep.fechaRemision,
      });
    });

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.height = 18;
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ordenes_trabajo_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }

  findOne(id: number) {
    return `This action returns a #${id} reporte`;
  }

  update(id: number, updateReporteDto: UpdateReporteDto) {
    return `This action updates a #${id} reporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} reporte`;
  }
}
