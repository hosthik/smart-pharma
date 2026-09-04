import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

export class CreateSaleItemDto {
  @IsInt()
  @Min(1)
  medicineId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsInt()
  @Min(1)
  pharmacyId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}