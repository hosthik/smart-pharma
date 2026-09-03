import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @Min(1)
  pharmacyId: number;

  @IsInt()
  @Min(1)
  medicineId: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  shelf?: string;

  @IsOptional()
  @IsString()
  row?: string;
}