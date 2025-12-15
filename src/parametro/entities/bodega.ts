import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seccion } from "./seccion";


@Entity()
export class Bodega {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    bodega:string;
    @OneToMany(()=>Seccion,(seccion)=>seccion.bodega)
    seccion:Seccion[]
}
