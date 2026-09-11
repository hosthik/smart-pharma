import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class TransportationRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRates() {
    return this.prisma.transportationRate.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  async createRate(type: string, ratePerKm: number) {
    return this.prisma.transportationRate.create({
      data: {
        type,
        ratePerKm,
        active: true,
      },
    });
  }

  async updateRate(id: number, ratePerKm: number) {
    const existingRate =
      await this.prisma.transportationRate.findUnique({
        where: {
          id,
        },
      });

    if (!existingRate) {
      throw new NotFoundException(
        "Transportation rate not found",
      );
    }

    return this.prisma.transportationRate.update({
      where: {
        id,
      },
      data: {
        ratePerKm,
      },
    });
  }
}