import { Test, TestingModule } from '@nestjs/testing';
import { OrdenDeTrabajoController } from './orden-de-trabajo.controller';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';

describe('OrdenDeTrabajoController', () => {
  let controller: OrdenDeTrabajoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenDeTrabajoController],
      providers: [OrdenDeTrabajoService],
    }).compile();

    controller = module.get<OrdenDeTrabajoController>(OrdenDeTrabajoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
