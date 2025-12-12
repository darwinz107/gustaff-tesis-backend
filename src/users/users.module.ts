import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { OrdenDeTrabajoModule } from 'src/orden-de-trabajo/orden-de-trabajo.module';
import { Cargo } from './entities/cargo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,Cargo]),RolesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[TypeOrmModule],
})
export class UsersModule {}
