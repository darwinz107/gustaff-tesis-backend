import { Injectable } from '@nestjs/common';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { RegistroSalida } from 'src/inventario/entities/registroSalida.entity';

@Injectable()
export class ReporteService {

   constructor(
     @InjectRepository(SolicitudOrden) private readonly solicitudOrdenRepository:Repository<SolicitudOrden>,
     @InjectRepository(RegistroSalida) private readonly registroSalidaRepository:Repository<RegistroSalida>,
   ) {}

  create(createReporteDto: CreateReporteDto) {
    return 'This action adds a new reporte';
  }

  findAll() {
    return `This action returns all reporte`;
  }

  async generarReporteOrdenTrabajo(res:Response) {
    
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const infoReporte = await this.solicitudOrdenRepository.createQueryBuilder('solicitudOrden')
    .leftJoinAndSelect('solicitudOrden.estadoTrabajo','estadoTrabajo')
    .where('MONTH(solicitudOrden.fechaRemision) = :mesActual AND YEAR(solicitudOrden.fechaRemision) = :anioActual',{mesActual, anioActual})
    .orderBy('solicitudOrden.id','DESC')
    .getMany()
    ;
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
   
    headerRow.eachCell((cell) => {
      cell.font = {bold:true};
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thick' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

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

    worksheet.eachRow({includeEmpty:false},(row, i) => {
      if (i === 1) return; 
    
      if(row.actualCellCount > 0){
      row.height = 18;
}
      row.eachCell({includeEmpty:true},(cell) => {
     const val = cell.value;

     const hashValue = val !== null && val !== undefined && !(typeof val === 'string' && val.trim() === '');

     if(hashValue){
       cell.alignment = { vertical: 'middle', horizontal: 'left' };
       cell.border = {
         top: { style: 'thin' },
         left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
     };
     
      };
      });
    
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ordenes_trabajo_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }

  async generarReporteActaSalida(res:Response){
  
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    const infoReporte = await this.registroSalidaRepository.createQueryBuilder('registroSalida')
    .leftJoinAndSelect('registroSalida.itemSalida','itemSalida')
    .leftJoinAndSelect('registroSalida.recibeSinSM','recibeSinSM')
    .where('MONTH(registroSalida.fechaRemision) = :mesActual AND YEAR(registroSalida.fechaRemision) = :anioActual',{mesActual, anioActual})
    .orderBy('registroSalida.id','DESC')
    .getMany()
    ;

    if(infoReporte.length === 0){
      res.status(404).json({message:'No hay datos para generar el reporte'});
      return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte Acta de Salida');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'NumActa', key: 'NumActa', width: 30 },
    { header: 'Cantidad', key: 'cantidad', width: 15 },
    { header: 'Fecha de Salida', key: 'fechaSalida', width: 20 },
    { header: 'Recibe', key: 'recibe', width: 25 },
    { header: 'Destino', key: 'destino', width: 25 },
    {header:'Items Entregados', key:'itemsEntregados', width:30},
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.font = {bold:true};
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thick' },
      right: { style: 'thin' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  infoReporte.forEach((rep)=>{
    const itemsEntregados = rep.itemSalida.map(item=>`${item.item} (Cantidad: ${item.cantidad})`).join(', ');
    worksheet.addRow({
      id: rep.id,
      NumActa: rep.numActa,
      cantidad: rep.itemSalida.reduce((sum, item) => sum + item.cantidad, 0),
      fechaSalida: rep.fechaRemision.getDate() + '/' + (rep.fechaRemision.getMonth() + 1) + '/' + rep.fechaRemision.getFullYear(),
      recibe: rep.recibeSinSM?.name ?? 'N/A',
      destino: rep.descripcion || 'N/A',
      itemsEntregados: itemsEntregados,
    });
  });

  worksheet.eachRow({includeEmpty:false},(row, i) => {
    if (i === 1) return;
    if(row.actualCellCount > 0){
      row.height = 18;
    }
    row.eachCell({includeEmpty:true},(cell) => {
     const val = cell.value;
      const hashValue = val !== null && val !== undefined && !(typeof val === 'string' && val.trim() === '');
      if(hashValue){
       cell.alignment = { vertical: 'middle', horizontal: 'left' };
       cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
       };
      }
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=reporte_acta_salida_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
