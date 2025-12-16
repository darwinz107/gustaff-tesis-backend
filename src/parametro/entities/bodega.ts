import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seccion } from "./seccion";
import { Inventario } from "src/inventario/entities/inventario.entity";


@Entity()
export class Bodega {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    bodega:string;
    @OneToMany(()=>Seccion,(seccion)=>seccion.bodega)
    seccion:Seccion[]
    @OneToMany(()=>Inventario,(inventario)=>inventario.bodega)
    inventario:Inventario[]
}
