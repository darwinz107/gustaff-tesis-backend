import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';

describe('SolicitudDeCompraService', () => {
  let service: SolicitudDeCompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudDeCompraService],
    }).compile();

    service = module.get<SolicitudDeCompraService>(SolicitudDeCompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
