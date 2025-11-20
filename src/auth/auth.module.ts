import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports:[TypeOrmModule.forFeature([Role]),UsersModule,RolesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
