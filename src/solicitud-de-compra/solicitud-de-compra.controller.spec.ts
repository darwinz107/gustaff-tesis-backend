import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDeCompraController } from './solicitud-de-compra.controller';
import { SolicitudDeCompraService } from './solicitud-de-compra.service';

describe('SolicitudDeCompraController', () => {
  let controller: SolicitudDeCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudDeCompraController],
      providers: [SolicitudDeCompraService],
    }).compile();

    controller = module.get<SolicitudDeCompraController>(SolicitudDeCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
