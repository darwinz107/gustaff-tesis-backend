import { Test, TestingModule } from '@nestjs/testing';
import { ParametroController } from './parametro.controller';
import { ParametroService } from './parametro.service';

describe('ParametroController', () => {
  let controller: ParametroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParametroController],
      providers: [ParametroService],
    }).compile();

    controller = module.get<ParametroController>(ParametroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
