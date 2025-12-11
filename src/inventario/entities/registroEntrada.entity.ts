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
     @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.infoEntrada)
          numSolicitudCompra:SolicitudDeCompra;   
     @ManyToOne(()=>Proovedores,(proovedores)=>proovedores.registroEntrada)
     proovedor:Proovedores;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.registroEntrada)
     itemEntrada:ItemsEntrada[];
     @Column()
     solicita:string;
     @Column()
     total:number;
}