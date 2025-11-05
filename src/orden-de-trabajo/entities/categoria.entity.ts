import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoTrabajo } from "./tipoTrabajo.entity";

@Entity()
export class Categoria{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    nombre:string;
    @OneToMany(()=>TipoTrabajo,(tipoTrabajo)=>tipoTrabajo.categoriaId)
    tipoTrabajo:TipoTrabajo[];
}