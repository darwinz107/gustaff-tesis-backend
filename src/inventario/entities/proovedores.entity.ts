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
     @Column({nullable:true})
     ruc:string;
     
     @Column({nullable:true})
     email:string;
     @Column({nullable:true})
     telefono:string;
     @Column({nullable:true})
     direccion:string;
     @Column({nullable:true})
     ciudad:string;
     @Column({nullable:true})
     notas:string;
     @OneToMany(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.proovedor)
     registroEntrada:RegistroEntrada[]
}
