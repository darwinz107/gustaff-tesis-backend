import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Proovedores } from "./proovedores.entity";
import { ItemsEntrada } from "./itemsEntrada.entity";
import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { ItemsSalida } from "./itemsSalida.entity";

@Entity()
export class RegistroSalida {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     numActa:number;
     @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.infoSalida)
     numSolicitudCompra:SolicitudDeCompra;    
     @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.regSalida)
     itemSalida:ItemsSalida[];
     @Column()
     total:number;
}