import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { PrescriptionService } from "./prescription.service.js";

@Controller("prescription")
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
  ) {}

  @Post("scan")
  @UseInterceptors(FileInterceptor("file"))
  async scanPrescription(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Please upload a prescription image.",
      );
    }

    return this.prescriptionService.scanPrescription(file);
  }
}