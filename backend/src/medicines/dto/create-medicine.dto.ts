import { IsOptional, IsString } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  category?: string;
}