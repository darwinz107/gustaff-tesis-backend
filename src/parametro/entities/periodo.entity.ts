import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Maquina } from "./maquina.entity";

@Entity()
export class Periodo {
   @PrimaryGeneratedColumn() 
   id: number;

   @Column()
   nombre: string;

   @OneToMany(() => Maquina, (maquina) => maquina.periodo)
   maquinas: Maquina[];
}
