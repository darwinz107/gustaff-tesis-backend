import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";

@Entity()
export class ItemsEntrada {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     item:string;
     @Column()
     stockMin:number;
     @Column()
     cantidad:number;
     @Column()
     costo:number;
     @Column()
     bodega:string;
     @Column()
     seccion:string;
     @Column()
     percha:string;
     @Column()
     destino:string;
     @ManyToOne(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.itemEntrada)
     registroEntrada:RegistroEntrada;
}