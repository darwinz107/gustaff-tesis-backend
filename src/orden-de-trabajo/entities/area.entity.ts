import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";

@Entity()
export class Area {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    nombre:string;
    @Column()
    cod:string;
     
    @OneToMany(()=>Codigo,(codigo)=>codigo.area)
    codigo:Codigo[]
}
