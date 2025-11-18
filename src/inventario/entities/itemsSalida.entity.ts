import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";
import { RegistroSalida } from "./registroSalida.entity";

@Entity()
export class ItemsSalida {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     nombre:string;
     @Column()
     cantidad:number;
     @Column()
     costo:number;
     @Column()
     destino:string;
     @ManyToOne(()=>RegistroSalida,(registroSalida)=>registroSalida.itemSalida)
     regSalida:RegistroSalida;
}