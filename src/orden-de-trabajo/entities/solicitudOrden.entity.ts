import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('solicitud_orden')
export class SolicitudOrden {
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'date'})
    fechaInicio :Date;
    @Column({type:'date'})
    fechaFinal:Date;
    @Column({type:'time'})
    HoraInicio:Date;
    @Column({type:'time'})
    HoraFinal:Date;
    @Column()
    Area:string;
    @Column()
    Codigo:string;
    @Column()
    Maquina:string;
    @Column()
    EspecificacionMaquina:string;
    @Column()
    Categoria:string;
    @Column()
    TipoTrabajo:string;
    @Column()
    DescripcionTrabajo:string;

}