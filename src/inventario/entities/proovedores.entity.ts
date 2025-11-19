import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RegistroEntrada } from "./registroEntrada.entity";

@Entity()
export class Proovedores {
     @PrimaryGeneratedColumn()
     id: number;
     @Column({ length: 150 })
     nombre: string;

     @Column({ length: 150 })
     ruc: string;

     @Column({ length: 255 })
     direccion: string;

     @Column({ length: 100 })
     telefono: string;

     @Column({ length: 150 })
     correo: string;
     @OneToMany(() => RegistroEntrada, (registroEntrada) => registroEntrada.proovedor)
     registroEntrada: RegistroEntrada[]
}
