import {
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class ReplyFeedbackDto {
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  adminReply: string;
}