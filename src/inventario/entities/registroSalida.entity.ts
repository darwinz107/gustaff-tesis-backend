import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { ItemsEntrada } from "./itemsEntrada.entity";
import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { ItemsSalida } from "./itemsSalida.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class RegistroSalida {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     numActa:string;
     
     @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.infoSalida,{nullable:true, onDelete:'SET NULL'})
     numSolicitudCompra:SolicitudDeCompra|null;   
     @Column()
     total:number; 
     @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.regSalida)
     itemSalida:ItemsSalida[];
     
     @Column({type:'datetime',default:()=>'CURRENT_TIMESTAMP'})
    fechaRemision:Date;

    @Column({nullable:true})
     descripcion:string;

    @Column()
     observacion:string;

    @ManyToOne(()=>User,(entrega)=>entrega.registroSalida,{nullable:true})
        entrega:User|null;

        @ManyToOne(()=>User,(recibeSinSM)=>recibeSinSM.registroSalida2,{nullable:true})
        
        recibeSinSM:User|null;
}