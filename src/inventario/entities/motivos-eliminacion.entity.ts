import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MotivosEliminacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  asunto: string;

  @Column({ type: 'varchar', length: 255 })
  numDocumento: string;
}
