import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from "@nestjs/common";

import type { Response } from "express";

import { DocumentService } from "./document.service.js";

import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { AdminGuard } from "./guards/admin.guard.js";

@Controller("admin/documents")
@UseGuards(
  JwtAuthGuard,
  AdminGuard,
)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
  ) {}

  @Get(":pharmacyId/:documentType")
  async getDocument(
    @Param(
      "pharmacyId",
      ParseIntPipe,
    )
    pharmacyId: number,

    @Param("documentType")
    documentType: string,

    @Res()
    response: Response,
  ) {
    const document =
      await this.documentService.getDocument(
        pharmacyId,
        documentType,
      );

    response.setHeader(
      "Content-Type",
      document.mimeType,
    );

    response.setHeader(
      "Content-Disposition",
      `inline; filename="${document.filename}"`,
    );

    response.setHeader(
      "X-Content-Type-Options",
      "nosniff",
    );

    response.setHeader(
      "Cache-Control",
      "private, no-store, max-age=0",
    );

    return response.sendFile(
      document.path,
    );
  }
}