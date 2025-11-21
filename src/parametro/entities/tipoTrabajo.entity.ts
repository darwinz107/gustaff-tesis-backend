import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "./categoria.entity";

@Entity()
export class TipoTrabajo{
   @PrimaryGeneratedColumn() 
   id:number;
   @Column()
   tipo:string;
   
}