import { Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Cargo])],
  controllers: [CargoController],
  providers: [CargoService],
})
export class CargoModule {}
