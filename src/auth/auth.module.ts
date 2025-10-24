import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Role])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
