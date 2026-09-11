import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { AuthModule } from "../auth/auth.module.js";

import { FeedbackController } from "./feedback.controller.js";
import { FeedbackService } from "./feedback.service.js";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    FeedbackController,
  ],
  providers: [
    FeedbackService,
  ],
  exports: [
    FeedbackService,
  ],
})
export class FeedbackModule {}