import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { ItemsEntrada } from "./itemsEntrada.entity";
import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";

@Entity()
export class RegistroEntrada {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     numActa:string;
     @Column()
     factura:string;
      @Column({type:'datetime',default:()=>'CURRENT_TIMESTAMP'})
         fechaRemision:Date;
     @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.infoEntrada,{nullable:true})
          numSolicitudCompra:SolicitudDeCompra|null;   
     @ManyToOne(()=>Proovedores,(proovedores)=>proovedores.registroEntrada)
     proovedor:Proovedores;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.registroEntrada)
     itemEntrada:ItemsEntrada[];
     
     @Column()
     total:number;
}