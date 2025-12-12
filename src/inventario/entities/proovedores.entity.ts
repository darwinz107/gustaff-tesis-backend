import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RegistroEntrada } from "./registroEntrada.entity";

@Entity()
export class Proovedores {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     nombre:string;
     @OneToMany(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.proovedor)
     registroEntrada:RegistroEntrada[]
}
