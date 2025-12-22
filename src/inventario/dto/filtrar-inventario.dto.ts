export class FiltrarInventarioDto {
  nombre?: string;
  bodega?: string;
  seccionId?: number;
  perchaId?: number;
  stockMin?: number;
  stockMax?: number;
  activo?: boolean;
}
