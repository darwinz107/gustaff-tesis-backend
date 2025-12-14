import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RegistroEntrada } from "./registroEntrada.entity";

@Entity()
export class Proovedores {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     nombre:string;
     @Column()
     nombreComercial:string;
     @Column()
     ruc:string;
     
     @Column()
     email:string;
     @Column()
     telefono:string;
     @Column()
     direccion:string;
     @Column()
     ciudad:string;
     @Column()
     notas:string;
     @OneToMany(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.proovedor)
     registroEntrada:RegistroEntrada[]
}
