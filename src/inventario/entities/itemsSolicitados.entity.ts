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
    @ManyToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.itemSolicitados)
    ordenCompra:SolicitudDeCompra;
}