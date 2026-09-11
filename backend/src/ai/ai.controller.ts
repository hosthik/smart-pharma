import {
  Body,
  Controller,
  Post,
} from "@nestjs/common";

import { AiService } from "./ai.service.js";
import { ChatDto } from "./dto/chat.dto.js";

@Controller("ai")
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post("chat")
  async chat(@Body() chatDto: ChatDto) {
    return this.aiService.chat(chatDto);
  }
}