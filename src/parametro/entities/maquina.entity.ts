import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";

@Entity()
export class Maquina{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   nombre:string;

   @Column({ type:'longtext',nullable: true })
   imagen:string;
   @ManyToOne(()=>Codigo,(codigo)=>codigo.maquina)
   @JoinColumn()
   codigo:Codigo;
}