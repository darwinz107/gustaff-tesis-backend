import { Test, TestingModule } from '@nestjs/testing';
import { ParametroService } from './parametro.service';

describe('ParametroService', () => {
  let service: ParametroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParametroService],
    }).compile();

    service = module.get<ParametroService>(ParametroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
