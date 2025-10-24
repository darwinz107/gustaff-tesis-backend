import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@Column()
identification:number;
@Column()
cellphone:number;
@ManyToOne(()=>Role,(role)=>role.user)
@JoinColumn({name:"rolId"})
rolId:Role;
}
