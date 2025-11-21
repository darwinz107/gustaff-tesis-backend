import { Cargo } from "src/users/entities/cargo.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:"rol"})
export class Role {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    role:string;
    @OneToMany(()=>Cargo,(cargo)=>cargo.rolId)
    cargo:Cargo[]
}
