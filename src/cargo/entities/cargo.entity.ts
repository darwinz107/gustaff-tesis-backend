import { Role } from "src/roles/entities/role.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cargo {
@PrimaryGeneratedColumn()    
id:number;    
@Column()    
nombre:string;
@OneToMany(()=>User,(user)=>user.infoCargo) 
user:User;
@ManyToOne(()=>Role,(role)=>role.infoRol)
rol:Role;
}
