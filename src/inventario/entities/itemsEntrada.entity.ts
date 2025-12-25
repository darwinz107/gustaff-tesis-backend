import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { RegistroEntrada } from "./registroEntrada.entity";
import { Inventario } from "./inventario.entity";

@Entity()
export class ItemsEntrada {
     @PrimaryGeneratedColumn()
     id:number;
     @ManyToOne(()=>Inventario,(inventario)=>inventario.itemEntrada)
               item:Inventario;  
    
     @Column()
     cantidad:number;
     @Column({type:"decimal",precision:10,scale:2})
     costo:number;  
     @Column({default:0})
     descuento: number;
     @Column({default:false})
    iva: boolean;
    @Column({type:"decimal",precision:10,scale:2})
    subtotal: number;
     @Column({nullable:true})
    Observacion:string;
    @Column({type:"decimal",precision:10,scale:2})
    total: number;   
     @ManyToOne(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.itemEntrada)
     registroEntrada:RegistroEntrada;
}