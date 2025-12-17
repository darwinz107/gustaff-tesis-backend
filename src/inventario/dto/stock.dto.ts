import { Type } from "class-transformer";
import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StockDto {
    @IsString()
    @IsNotEmpty()
    item:string;
    @IsNotEmpty()
    @Type(()=>Number)
    @IsNumber()
    cantidad:number;
}