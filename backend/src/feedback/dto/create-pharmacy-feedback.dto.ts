import {
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreatePharmacyFeedbackDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}