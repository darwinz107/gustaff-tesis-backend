import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametroModule } from 'src/parametro/parametro.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature(),UsersModule,RolesModule,ParametroModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
