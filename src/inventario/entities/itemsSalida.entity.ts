import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";
import { RegistroSalida } from "./registroSalida.entity";
import { Inventario } from "./inventario.entity";

@Entity()
export class ItemsSalida {
     @PrimaryGeneratedColumn()
     id:number;
     @ManyToOne(()=>Inventario,(inventario)=>inventario.salida)
     infoItem:Inventario;
     @Column()
     cantidad:number;
     
     @Column()
     destino:string;
     @ManyToOne(()=>RegistroSalida,(registroSalida)=>registroSalida.itemSalida)
     regSalida:RegistroSalida;
}