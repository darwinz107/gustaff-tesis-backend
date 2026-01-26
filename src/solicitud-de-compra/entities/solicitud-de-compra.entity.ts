import { ItemsSolicitados } from "src/inventario/entities/itemsSolicitados.entity";
import { RegistroSalida } from "src/inventario/entities/registroSalida.entity";
import { SolicitudOrden } from "src/orden-de-trabajo/entities/solicitudOrden.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadoCompra } from "./estadoCompra";
import { RegistroEntrada } from "src/inventario/entities/registroEntrada.entity";

@Entity()
export class SolicitudDeCompra {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    numOrden:string;
    
    @OneToOne(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.solicitudTrabajo,{nullable:true,onDelete:'SET NULL'})
    @JoinColumn()
    numOrdenTrabajo:SolicitudOrden;
    @Column({type:'datetime',default:()=>'CURRENT_TIMESTAMP'})
    fechaRemision:Date;
    @Column()
    Autoriza:string;
    
    @OneToMany(()=>ItemsSolicitados,(itemsSolicitados)=>itemsSolicitados.ordenCompra)
    itemSolicitados:ItemsSolicitados[]
    @OneToMany(()=>RegistroSalida,(registroSalida)=>registroSalida.numSolicitudCompra)
    infoSalida:RegistroSalida[]
    @OneToMany(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.numSolicitudCompra)
    infoEntrada:RegistroEntrada[]
    @ManyToOne(()=>EstadoCompra,(estadoCompra)=>estadoCompra.solicitudCompra)
    estadoCompra:EstadoCompra;
}
