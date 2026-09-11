import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  accountName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  branch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instructions?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}