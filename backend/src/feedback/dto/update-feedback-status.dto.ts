import {
  IsIn,
  IsString,
} from "class-validator";

export class UpdateFeedbackStatusDto {
  @IsString()
  @IsIn([
    "NEW",
    "REVIEWING",
    "RESPONDED",
    "RESOLVED",
  ])
  status: string;
}