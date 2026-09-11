import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { MedicinesController } from "./medicines.controller.js";
import { MedicinesService } from "./medicines.service.js";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    MedicinesController,
  ],
  providers: [
    MedicinesService,
  ],
  exports: [
    MedicinesService,
  ],
})
export class MedicinesModule {}