import { Injectable, Logger } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';
import { CreateItemsSolicitadosDto } from 'src/inventario/dto/create-items-solicitados.dto';

@Injectable()
export class MailService {
private readonly logger = new Logger(MailService.name);
   constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  private readonly mailer:MailerService,
  ){}

  create(createMailDto: CreateMailDto) {
    return 'This action adds a new mail';
  }


   async sendNotificationStockVacio(items:string[]) {
    try {
      
      const users = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id','user.email'])
        .getMany();

      const emails = users.map(u => u.email).filter(Boolean);
      if (emails.length === 0) {
        this.logger.warn('No se encontraron usuarios para notificar.');
        return;
      }

      const subject = `Items sin stock`;
      const html = `
        <p>Hola,</p>
        <p>El item o los items <strong>${items.join(",")}</strong> se han quedado sin stock por lo que las solicitudes generadas con estos items se mostraran 
        solo en la seccion para generar las entradas a inventario.</p>
        <p>Saludos,<br/>Sistema de Inventario</p>
      `;

      await this.mailer.sendMail({
        to: emails,
        subject,
        html,
      });

      this.logger.log(`Notificación enviada a: ${emails.join(', ')}`);
    } catch (err) {
      this.logger.error('Error enviando notificación por correo', err);
    }
  }

   async sendEstadoChangeNotification(solicitudId: string, nuevoEstado: string, detalles?: any) {
    try {
      
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.cargoId', 'cargo')
        .innerJoinAndSelect('cargo.rolId', 'rol')
        .where('rol.role IN (:...roles)', { roles: ['admin', 'COORDINADOR DE MANTENIMIENTO'] })
        .select(['user.id','user.email'])
        .getMany();

      const emails = users.map(u => u.email).filter(Boolean);
      if (emails.length === 0) {
        this.logger.warn('No se encontraron usuarios para notificar.');
        return;
      }

      const subject = `Cambio de estado: Solicitud ${solicitudId} → ${nuevoEstado}`;
      const html = `
        <p>Hola,</p>
        <p>La solicitud de material <strong>${solicitudId}</strong> cambió su estado a <strong>${nuevoEstado}</strong>.</p>
        ${detalles ? `<p>Detalles: ${detalles}</p>` : ''}
        <p>Saludos,<br/>Sistema de Inventario</p>
      `;

      await this.mailer.sendMail({
        to: emails,
        subject,
        html,
      });

      this.logger.log(`Notificación enviada a: ${emails.join(', ')}`);
    } catch (err) {
      this.logger.error('Error enviando notificación por correo', err);
    }
  }


     async sendnewSolMaterialNotification(numOrdenTrabajo: string,numSolMaterial: string, createItemsSolicitadosDto:CreateItemsSolicitadosDto[]) {
    try {
      
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.cargoId', 'cargo')
        .innerJoinAndSelect('cargo.rolId', 'rol')
        .where('rol.role IN (:...roles)', { roles: ['admin', 'JEFE DE LOGISTICA INTERNA'] })
        .select(['user.id','user.email'])
        .getMany();

      const emails = users.map(u => u.email).filter(Boolean);
      if (emails.length === 0) {
        this.logger.warn('No se encontraron usuarios para notificar.');
        return;
      }

      const subject = `Nueva solicitud de material`;
      const html = `
        <p>Hola,</p>
        <p>Se creo una nueva solicitud de material con #<strong>${numSolMaterial}</strong> asociada a la orden de trabajo # <strong>${numOrdenTrabajo}</strong>.</p>
<p>Detalles: <table>
  <table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse;">
    <tr style="background:#f2f2f2;">
      <th align="left">Item</th>
      <th align="center">Cantidad</th>
      <th align="left">Característica</th>
      <th align="center">Estado</th>
    </tr>

 ${createItemsSolicitadosDto.map((i)=> 
  `<tr>
    <td>${i.item}</td>
    <td align="center">${i.cantidad}</td>
    <td>${i.caracteristica}</td>
    <td align="center">${i.existencia ? "En stock": "Por Comprar"}</td>
  </tr>`
 ).join('')}
</table>
  <p>Saludos,<br/>Area de mantenimiento</p>
      `;

      await this.mailer.sendMail({
        to: emails,
        subject,
        html,
      });

      this.logger.log(`Notificación enviada a: ${emails.join(', ')}`);
    } catch (err) {
      this.logger.error('Error enviando notificación por correo', err);
    }
  }


  findAll() {
    return `This action returns all mail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  update(id: number, updateMailDto: UpdateMailDto) {
    return `This action updates a #${id} mail`;
  }

  remove(id: number) {
    return `This action removes a #${id} mail`;
  }
}
