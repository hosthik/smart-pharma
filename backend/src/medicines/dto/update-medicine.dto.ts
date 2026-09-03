import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  category?: string;
}