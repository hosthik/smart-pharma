import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";

import { SalesService } from "./sales.service.js";
import { CreateSaleDto } from "./dto/create-sale.dto.js";

@Controller("sales")
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
  ) {}

  @Post()
  createSale(
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.createSale(dto);
  }

  @Get("pharmacy/:pharmacyId")
  getSalesByPharmacy(
    @Param(
      "pharmacyId",
      ParseIntPipe,
    )
    pharmacyId: number,
  ) {
    return this.salesService.getSalesByPharmacy(
      pharmacyId,
    );
  }

  @Get(":id")
  getSale(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.salesService.getSale(id);
  }
}