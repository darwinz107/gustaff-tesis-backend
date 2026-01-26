/*import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Maquina } from "./maquina.entity";
import { TipoMantenimiento } from "./tipoMantenimiento.entity";
import { Periodo } from "./periodo.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class ProgramacionMantenimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Maquina, (maquina) => maquina.programacionMantenimiento)
  @JoinColumn()
  maquina: Maquina;

  @ManyToOne(() => TipoMantenimiento)
  @JoinColumn()
  tipoMantenimiento: TipoMantenimiento;

  @ManyToOne(() => Periodo, (periodo) => periodo.programacionMantenimiento)
  @JoinColumn()
  periodo: Periodo;

  @Column({ type: 'date' })
  fechaProgramada: Date;

  @ManyToOne(() => User)
  @JoinColumn()
  tecnico1: User;

  @ManyToOne(() => User)
  @JoinColumn()
  tecnico2: User;

  @Column({ type: 'int', nullable: true })
  cantidad: number;

  @Column({ type: 'varchar', nullable: true })
  item: string;

  @Column({ type: 'longtext', nullable: true })
  observacion: string;
}
*/