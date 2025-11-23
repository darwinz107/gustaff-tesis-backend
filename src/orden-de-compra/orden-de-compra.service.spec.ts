import { Test, TestingModule } from '@nestjs/testing';
import { OrdenDeCompraService } from './orden-de-compra.service';

describe('OrdenDeCompraService', () => {
  let service: OrdenDeCompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdenDeCompraService],
    }).compile();

    service = module.get<OrdenDeCompraService>(OrdenDeCompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
