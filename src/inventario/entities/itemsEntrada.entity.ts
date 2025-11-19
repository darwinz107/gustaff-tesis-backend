import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";
import { Inventario } from "./inventario.entity";

@Entity()
export class ItemsEntrada {
     @PrimaryGeneratedColumn()
     id:number;
    @ManyToOne(()=>Inventario,(inventario)=>inventario.entrada)
     infoItem:Inventario;
     @Column()
     stockMin:number;
     @Column()
     cantidad:number;
    
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