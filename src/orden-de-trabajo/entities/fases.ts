import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Jornada } from "./jornadas";

@Entity()
export class Fases{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    hora:string;
    @Column({default:false})
    completo:boolean;
    @Column({nullable:true})
    descripcion:string;
    @ManyToOne(()=>Jornada,(jornada)=>jornada.fases)
    jornada:Jornada;
}