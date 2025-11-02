import { Test, TestingModule } from '@nestjs/testing';
import { OrdenDeTrabajoService } from './orden-de-trabajo.service';

describe('OrdenDeTrabajoService', () => {
  let service: OrdenDeTrabajoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdenDeTrabajoService],
    }).compile();

    service = module.get<OrdenDeTrabajoService>(OrdenDeTrabajoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
