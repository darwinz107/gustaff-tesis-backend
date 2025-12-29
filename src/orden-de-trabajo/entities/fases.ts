import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Jornada } from "./jornadas";

@Entity()
export class Fases{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'time'})
    hora:string;
    @Column({default:false})
    completo:boolean;
    @Column({nullable:true})
    descripcion:string;
    @Column({default:false})
    agotado:boolean;
    @ManyToOne(()=>Jornada,(jornada)=>jornada.fases)
    jornada:Jornada;
}