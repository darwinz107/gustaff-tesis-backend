import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { ItemsEntrada } from "./itemsEntrada.entity";

@Entity()
export class RegistroEntrada {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     numActa:number;
     @Column()
     factura:string;
     @ManyToOne(()=>Proovedores,(proovedores)=>proovedores.registroEntrada)
     proovedor:Proovedores;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.registroEntrada)
     itemEntrada:ItemsEntrada[];
     @Column()
     solicita:string;
     @Column()
     total:number;
}