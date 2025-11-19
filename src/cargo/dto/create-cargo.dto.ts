import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCargoDto {
    @IsNumber()
    @IsNotEmpty() 
    cargo:string;
    @IsNumber()
    @IsNotEmpty()
    rolId:number;
}
