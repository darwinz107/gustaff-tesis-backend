import { IsNotEmpty, IsString } from "class-validator";

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    area:string;
    @IsString()
    @IsNotEmpty()
    cod:string;
}