import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Maquina } from "./maquina.entity";

@Entity()
export class TipoMantenimiento {
   @PrimaryGeneratedColumn() 
   id: number;

   @Column({ length: 2 })
   inicial: string;

   @Column()
   mantenimiento: string;

   @OneToMany(() => Maquina, (maquina) => maquina.tipoMantenimiento)
   maquinas: Maquina[];
}
