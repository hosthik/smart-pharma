import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

import { Type } from "class-transformer";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  pharmacyId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    "Professional",
    "Enterprise",
  ])
  plan: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}