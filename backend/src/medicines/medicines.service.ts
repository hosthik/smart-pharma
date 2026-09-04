import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

import { CreateMedicineDto } from "./dto/create-medicine.dto.js";
import { UpdateMedicineDto } from "./dto/update-medicine.dto.js";

@Injectable()
export class MedicinesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateMedicineDto,
  ) {
    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        genericName: dto.genericName,
        category: dto.category,
      },
    });
  }

  async findAll() {
    return this.prisma.medicine.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: number) {
    const medicine =
      await this.prisma.medicine.findUnique({
        where: {
          id,
        },
      });

    if (!medicine) {
      throw new NotFoundException(
        "Medicine not found.",
      );
    }

    return medicine;
  }

  async update(
    id: number,
    dto: UpdateMedicineDto,
  ) {
    await this.findOne(id);

    return this.prisma.medicine.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.medicine.delete({
      where: {
        id,
      },
    });
  }

  async searchMedicines(
    query: string,
    pharmacyId?: number,
  ) {
    const search = query?.trim();

    if (!search) {
      return [];
    }

    if (
      pharmacyId !== undefined &&
      (!Number.isInteger(pharmacyId) ||
        pharmacyId < 1)
    ) {
      throw new BadRequestException(
        "Invalid pharmacyId.",
      );
    }

    /*
     * If a pharmacy ID is supplied, this is a pharmacy-side
     * search. The pharmacy itself must exist.
     */
    if (pharmacyId !== undefined) {
      const pharmacy =
        await this.prisma.pharmacy.findUnique({
          where: {
            id: pharmacyId,
          },
        });

      if (!pharmacy) {
        throw new NotFoundException(
          "Pharmacy not found.",
        );
      }
    }

    const medicines =
      await this.prisma.medicine.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              genericName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },

        include: {
          inventory: {
            where: {
              /*
               * Patients must only see inventory belonging
               * to verified pharmacies.
               *
               * When pharmacyId is supplied, we still allow
               * the pharmacy owner/staff to search their own
               * inventory.
               */
              OR: [
                ...(pharmacyId !== undefined
                  ? [
                      {
                        pharmacyId,
                      },
                    ]
                  : []),
                {
                  pharmacy: {
                    verificationStatus:
                      "APPROVED",
                  },
                },
              ],
            },

            include: {
              pharmacy: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      });

    /*
     * Record patient/pharmacy medicine searches only when
     * a pharmacy ID was explicitly supplied.
     */
    if (
      pharmacyId !== undefined &&
      medicines.length > 0
    ) {
      await this.prisma.medicineSearch.createMany({
        data: medicines.map(
          (medicine) => ({
            pharmacyId,
            medicineId: medicine.id,
          }),
        ),
      });
    }

    return medicines.map(
      (medicine) => ({
        id: medicine.id,
        name: medicine.name,
        genericName:
          medicine.genericName,
        category:
          medicine.category,

        pharmacies:
          medicine.inventory.map(
            (item) => ({
              pharmacyId:
                item.pharmacyId,

              pharmacyName:
                item.pharmacy.name,

              address:
                item.pharmacy.address,

              phone:
                item.pharmacy.phone,

              latitude:
                item.pharmacy.latitude,

              longitude:
                item.pharmacy.longitude,

              quantity:
                item.quantity,

              price:
                item.price,

              stockStatus:
                item.stockStatus,

              section:
                item.section,

              shelf:
                item.shelf,

              row:
                item.row,

              updatedAt:
                item.updatedAt,
            }),
          ),
      }),
    );
  }
}