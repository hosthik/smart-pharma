
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  pharmacyId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    "ONE_WEEK",
    "ONE_MONTH",
    "6_MONTHS",
    "1_YEAR",
    "LIFETIME",
  ])
  plan: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bankAccountId: number;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}

