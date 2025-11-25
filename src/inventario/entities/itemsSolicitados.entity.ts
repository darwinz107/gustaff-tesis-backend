import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { Inventario } from "./inventario.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class ItemsSolicitados{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    item:string;
    @Column()
    cantidad:number;
    @Column({nullable:true})
    caracteristica:string;
    @Column({nullable:true})
    Observacion:string;
    @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.itemSolicitados)
    ordenCompra:SolicitudDeCompra;
    @Column({type:'boolean'})
    existencia:boolean;
}