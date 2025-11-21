import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Maquina } from "./maquina.entity";

@Entity()
export class Codigo{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   cod:string;
   @ManyToOne(()=>Area,(area)=>area.codigo)
   @JoinColumn()
   area:Area;

   @OneToMany(()=>Maquina,(maquina)=>maquina.codigo)
   maquina:Maquina[]
}