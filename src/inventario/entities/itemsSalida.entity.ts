import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";
import { RegistroSalida } from "./registroSalida.entity";
import { Inventario } from "./inventario.entity";

@Entity()
export class ItemsSalida {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     item:string;
     @Column()
     cantidad:number;
     /*@Column()
     costo:number;*/
     /*@Column()
     destino:string;*/
     @Column({nullable:true})
    Observacion:string;
     @ManyToOne(()=>RegistroSalida,(registroSalida)=>registroSalida.itemSalida,{nullable:true,onDelete:'SET NULL'})
     regSalida:RegistroSalida|null;
     @ManyToOne(()=>Inventario,(inventario)=>inventario.itemsSalida,{nullable:true,onDelete:'SET NULL'})
     inventario:Inventario; 
     @Column()
     caracteristica:string;
}