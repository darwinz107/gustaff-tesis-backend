import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Role } from "src/roles/entities/role.entity";

@Entity()
export class Cargo {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@ManyToOne(()=>Role,(role)=>role.cargo)
@JoinColumn({name:"rolId"})
rolId:Role;

@OneToMany(()=>User,(user)=>user.cargoId)
relacionUser:User[];
}