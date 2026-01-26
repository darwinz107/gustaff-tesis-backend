import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Proovedores } from './entities/proovedores.entity';
import { RegistroSalida } from './entities/registroSalida.entity';
import { ItemsSalida } from './entities/itemsSalida.entity';
import { ItemsSolicitados } from './entities/itemsSolicitados.entity';
import { RegistroEntrada } from './entities/registroEntrada.entity';
import { ItemsEntrada } from './entities/itemsEntrada.entity';
import { SolicitudDeCompraModule } from 'src/solicitud-de-compra/solicitud-de-compra.module';
import { AdminModule } from 'src/admin/admin.module';
import { Bodega } from 'src/parametro/entities/bodega';
import { Seccion } from 'src/parametro/entities/seccion';
import { Percha } from 'src/parametro/entities/percha';
import { MailModule } from 'src/mail/mail.module';
import { Maquina } from 'src/parametro/entities/maquina.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Inventario,Proovedores,ItemsSolicitados,RegistroSalida,ItemsSalida,RegistroEntrada,ItemsEntrada,Bodega,Seccion,Percha,Maquina,User]),SolicitudDeCompraModule,AdminModule,MailModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports:[]
})
export class InventarioModule {}
