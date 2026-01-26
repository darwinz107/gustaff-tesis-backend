import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametroModule } from 'src/parametro/parametro.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { Bodega } from 'src/parametro/entities/bodega';
import { Seccion } from 'src/parametro/entities/seccion';
import { Percha } from 'src/parametro/entities/percha';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { SolicitudOrden } from 'src/orden-de-trabajo/entities/solicitudOrden.entity';
import { RegistroEntrada } from 'src/inventario/entities/registroEntrada.entity';
import { RegistroSalida } from 'src/inventario/entities/registroSalida.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Inventario,SolicitudOrden,RegistroEntrada,RegistroSalida]),UsersModule,RolesModule,ParametroModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports:[AdminService]
})
export class AdminModule {}
