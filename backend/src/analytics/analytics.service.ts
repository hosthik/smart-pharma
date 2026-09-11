import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(
    pharmacyId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id: pharmacyId,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
    }

    const patientSearchDateFilter: {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (startDate) {
      const start = new Date(startDate);

      if (!Number.isNaN(start.getTime())) {
        patientSearchDateFilter.createdAt = {
          ...(patientSearchDateFilter.createdAt ?? {}),
          gte: start,
        };
      }
    }

    if (endDate) {
      const end = new Date(endDate);

      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);

        patientSearchDateFilter.createdAt = {
          ...(patientSearchDateFilter.createdAt ?? {}),
          lte: end,
        };
      }
    }

    const [
      totalMedicines,
      available,
      lowStock,
      outOfStock,
      totalUnitsAggregate,
      patientSearches,
      demandGroups,
    ] = await Promise.all([
      this.prisma.inventory.count({
        where: {
          pharmacyId,
        },
      }),

      this.prisma.inventory.count({
        where: {
          pharmacyId,
          stockStatus: "AVAILABLE",
        },
      }),

      this.prisma.inventory.count({
        where: {
          pharmacyId,
          stockStatus: "LOW_STOCK",
        },
      }),

      this.prisma.inventory.count({
        where: {
          pharmacyId,
          stockStatus: "OUT_OF_STOCK",
        },
      }),

      this.prisma.inventory.aggregate({
        where: {
          pharmacyId,
        },
        _sum: {
          quantity: true,
        },
      }),

      // Global public patient searches.
      this.prisma.medicineSearch.count({
        where: patientSearchDateFilter,
      }),

      // Global search demand.
      this.prisma.medicineSearch.groupBy({
        by: ["medicineId"],
        where: {
          medicineId: {
            not: null,
          },
          ...patientSearchDateFilter,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            medicineId: "desc",
          },
        },
        take: 10,
      }),
    ]);

    const totalUnits =
      totalUnitsAggregate._sum?.quantity ?? 0;

    const demand = await Promise.all(
      demandGroups
        .filter(
          (
            item,
          ): item is typeof item & {
            medicineId: number;
          } => item.medicineId !== null,
        )
        .map(async (item) => {
          const medicine =
            await this.prisma.medicine.findUnique({
              where: {
                id: item.medicineId,
              },
            });

          const inventory =
            await this.prisma.inventory.findUnique({
              where: {
                pharmacyId_medicineId: {
                  pharmacyId,
                  medicineId: item.medicineId,
                },
              },
            });

          return {
            medicineId: item.medicineId,
            medicineName:
              medicine?.name ?? "Unknown Medicine",
            searchCount:
              item._count?._all ?? 0,
            pharmacyStock:
              inventory?.quantity ?? 0,
            pharmacyPrice:
              inventory?.price ?? 0,
            stockStatus:
              inventory?.stockStatus ??
              "OUT_OF_STOCK",
          };
        }),
    );

    return {
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email,
        verificationStatus: pharmacy.verificationStatus,
      },

      period: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      },

      summary: {
        totalMedicines,
        available,
        lowStock,
        outOfStock,
        totalUnits,
        patientSearches,
      },

      inventory: {
        totalMedicines,
        available,
        lowStock,
        outOfStock,
        totalUnits,
      },

      demand,

      patientDemand: demand,

      mostSearchedMedicine:
        demand[0] ?? null,
    };
  }
}