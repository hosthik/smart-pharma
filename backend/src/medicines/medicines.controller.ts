import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { MedicinesService } from "./medicines.service.js";
import { CreateMedicineDto } from "./dto/create-medicine.dto.js";
import { UpdateMedicineDto } from "./dto/update-medicine.dto.js";

@Controller("medicines")
export class MedicinesController {
  constructor(
    private readonly medicinesService: MedicinesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateMedicineDto,
  ) {
    return this.medicinesService.create(dto);
  }

  @Get()
  findAll() {
    return this.medicinesService.findAll();
  }

  @Get("search")
  search(
    @Query("q") query: string,
    @Query(
      "pharmacyId",
    )
    pharmacyId?: string,
  ) {
    const parsedPharmacyId =
      pharmacyId
        ? Number(pharmacyId)
        : undefined;

    return this.medicinesService.searchMedicines(
      query,
      parsedPharmacyId,
    );
  }

  @Get(":id")
  findOne(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.medicinesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(
      id,
      dto,
    );
  }

  @Delete(":id")
  remove(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.medicinesService.remove(id);
  }
}