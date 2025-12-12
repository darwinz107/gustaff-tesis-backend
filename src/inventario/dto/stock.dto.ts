import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StockDto {
    @IsString()
    @IsNotEmpty()
    item:string;
    @IsNotEmpty()
    @IsNumber()
    cantidad:number;
}