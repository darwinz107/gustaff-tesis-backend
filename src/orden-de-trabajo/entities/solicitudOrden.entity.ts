import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Codigo } from "./codigo.entity";
import { Maquina } from "./maquina.entity";


@Entity('orden_trabajo')
export class SolicitudOrden {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    NumOrden:string;
    @Column({type:'date'})
    fechaInicio:Date;
    @Column({type:'date'})
    fechaFinal:Date;
    @Column({type:'time'})
    HoraInicio:Date;
    @Column({type:'time'})
    HoraFinal:Date;
    //@Column()
    @ManyToOne(()=>Area,(area)=>area.infoArea)
    area:Area;
    //@Column()
    @ManyToOne(()=>Codigo,(codigo)=>codigo.infoCodigo)
    codigo:Codigo;
    //@Column()
    @ManyToOne(()=>Maquina,(maquina)=>maquina.infoMaquina)
    maquina:Maquina;
    @Column({nullable:true})
    EspecificacionMaquina:string;
    @Column()
    Categoria:string;
    @Column()
    TipoTrabajo:string;
    @Column({nullable:true})
    DescripcionTrabajo:string;
    @Column({default:"En proceso"})
    Estado:string;
    @ManyToOne(()=>User,(user)=>user.solicitanteId)
    userSolicitante:User;
    @ManyToOne(()=>User,(user)=>user.receptorId)
    userReceptor:User;
    @ManyToOne(()=>User,(user)=>user.tecnicoId,{nullable:true})
    userTecnico:User|null; 
    @OneToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.numOrdenTrabajo)
    solicitudTrabajo:SolicitudDeCompra;
}