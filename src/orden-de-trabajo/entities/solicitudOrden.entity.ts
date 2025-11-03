import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


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
    @ManyToOne(()=>User,(user)=>user.solicitanteId)
    userSolicitante:User;
    @ManyToOne(()=>User,(user)=>user.receptorId)
    userReceptor:User;
    @ManyToOne(()=>User,(user)=>user.tecnicoId)
    userTecnico:User; 
}