import { ItemsSolicitados } from "src/inventario/entities/itemsSolicitados.entity";
import { RegistroSalida } from "src/inventario/entities/registroSalida.entity";
import { SolicitudOrden } from "src/orden-de-trabajo/entities/solicitudOrden.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadoCompra } from "./estadoCompra";

@Entity()
export class SolicitudDeCompra {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    numOrden:string;
    
    @OneToOne(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.solicitudTrabajo)
    @JoinColumn()
    numOrdenTrabajo:SolicitudOrden;
    @Column({type:'datetime',default:()=>'CURRENT_TIMESTAMP'})
    fechaRemision:Date;
    @Column()
    Autoriza:string;
    @Column()
    Destino:string;
    @OneToMany(()=>ItemsSolicitados,(itemsSolicitados)=>itemsSolicitados.ordenCompra)
    itemSolicitados:ItemsSolicitados[]
    @OneToMany(()=>RegistroSalida,(registroSalida)=>registroSalida.numSolicitudCompra)
    infoSalida:RegistroSalida[]
    @ManyToOne(()=>EstadoCompra,(estadoCompra)=>estadoCompra.solicitudCompra)
    estadoCompra:EstadoCompra;
}
