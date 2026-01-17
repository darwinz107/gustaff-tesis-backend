import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";
/*import { TipoMantenimiento } from "./tipoMantenimiento.entity";
import { Periodo } from "./periodo.entity";*/

@Entity()
export class Maquina{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   nombre:string;

   @Column({ type:'longtext',nullable: true })
   imagen:string;
   @ManyToOne(()=>Codigo,(codigo)=>codigo.maquina)
   @JoinColumn()
   codigo:Codigo;

   /*@ManyToOne(() => TipoMantenimiento, (tipoMantenimiento) => tipoMantenimiento.maquinas, { nullable: true })
   @JoinColumn()
   tipoMantenimiento: TipoMantenimiento;

   @ManyToOne(() => Periodo, (periodo) => periodo.maquinas, { nullable: true })
   @JoinColumn()
   periodo: Periodo;*/
}