
import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";

@Module({
  controllers: [AiController],
  providers: [AiService, PrismaService],
  exports: [AiService],
})
export class AiModule {}
