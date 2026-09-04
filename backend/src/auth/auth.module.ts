import {
  Module,
} from "@nestjs/common";

import {
  JwtModule,
} from "@nestjs/jwt";

import {
  AuthController,
} from "./auth.controller.js";

import {
  AuthService,
} from "./auth.service.js";

import {
  DocumentController,
} from "./document.controller.js";

import {
  DocumentService,
} from "./document.service.js";

import {
  JwtAuthGuard,
} from "./guards/jwt-auth.guard.js";

import {
  AdminGuard,
} from "./guards/admin.guard.js";

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        "smartpharma-dev-secret",

      signOptions: {
        expiresIn: "1d",
      },
    }),
  ],

  controllers: [
    AuthController,
    DocumentController,
  ],

  providers: [
    AuthService,
    DocumentService,
    JwtAuthGuard,
    AdminGuard,
  ],

  exports: [
    JwtAuthGuard,
    AdminGuard,
  ],
})
export class AuthModule {}