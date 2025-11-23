import { Test, TestingModule } from '@nestjs/testing';
import { OrdenDeCompraController } from './orden-de-compra.controller';
import { OrdenDeCompraService } from './orden-de-compra.service';

describe('OrdenDeCompraController', () => {
  let controller: OrdenDeCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenDeCompraController],
      providers: [OrdenDeCompraService],
    }).compile();

    controller = module.get<OrdenDeCompraController>(OrdenDeCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
