import { Cargo } from "src/cargo/entities/cargo.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:"rol"})
export class Role {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    role:string;
    @OneToMany(()=>Cargo,(cargo)=>cargo.rol)
    infoRol:Cargo[]
}
