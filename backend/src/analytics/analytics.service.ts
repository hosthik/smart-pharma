import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAnalytics(
    pharmacyId: number,
    startDate?: string,
    endDate?: string,
  ) {
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

    const start = startDate
      ? new Date(startDate)
      : undefined;

    const end = endDate
      ? new Date(endDate)
      : undefined;

    if (
      start &&
      Number.isNaN(start.getTime())
    ) {
      throw new Error(
        "Invalid startDate.",
      );
    }

    if (
      end &&
      Number.isNaN(end.getTime())
    ) {
      throw new Error(
        "Invalid endDate.",
      );
    }

    const saleDateFilter =
      start || end
        ? {
            createdAt: {
              ...(start
                ? { gte: start }
                : {}),
              ...(end
                ? { lte: end }
                : {}),
            },
          }
        : {};

    const [
      sales,
      revenue,
      saleItems,
      inventory,
      searches,
    ] = await Promise.all([
      this.prisma.sale.count({
        where: {
          pharmacyId,
          ...saleDateFilter,
        },
      }),

      this.prisma.sale.aggregate({
        where: {
          pharmacyId,
          ...saleDateFilter,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      this.prisma.saleItem.findMany({
        where: {
          sale: {
            pharmacyId,
            ...saleDateFilter,
          },
        },
        include: {
          medicine: true,
        },
      }),

      this.prisma.inventory.findMany({
        where: {
          pharmacyId,
        },
        include: {
          medicine: true,
        },
      }),

      this.prisma.medicineSearch.findMany({
        where: {
          pharmacyId,
          ...(start || end
            ? {
                createdAt: {
                  ...(start
                    ? { gte: start }
                    : {}),
                  ...(end
                    ? { lte: end }
                    : {}),
                },
              }
            : {}),
        },
        include: {
          medicine: true,
        },
      }),
    ]);

    const totalRevenue =
      revenue._sum.totalAmount ?? 0;

    const totalUnitsSold =
      saleItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0,
      );

    const topSellingMap =
      new Map<
        number,
        {
          medicineId: number;
          medicine: string;
          quantity: number;
          revenue: number;
        }
      >();

    for (const item of saleItems) {
      const existing =
        topSellingMap.get(
          item.medicineId,
        );

      if (existing) {
        existing.quantity +=
          item.quantity;

        existing.revenue +=
          item.totalPrice;
      } else {
        topSellingMap.set(
          item.medicineId,
          {
            medicineId:
              item.medicineId,
            medicine:
              item.medicine.name,
            quantity:
              item.quantity,
            revenue:
              item.totalPrice,
          },
        );
      }
    }

    const topSelling =
      Array.from(
        topSellingMap.values(),
      )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity,
        )
        .slice(0, 10);

    const demandMap =
      new Map<
        number,
        {
          medicineId: number;
          medicine: string;
          searches: number;
        }
      >();

    for (const search of searches) {
      const existing =
        demandMap.get(
          search.medicineId,
        );

      if (existing) {
        existing.searches += 1;
      } else {
        demandMap.set(
          search.medicineId,
          {
            medicineId:
              search.medicineId,
            medicine:
              search.medicine.name,
            searches: 1,
          },
        );
      }
    }

    const demand =
      Array.from(
        demandMap.values(),
      )
        .sort(
          (a, b) =>
            b.searches -
            a.searches,
        )
        .slice(0, 10)
        .map((item) => {
          const stock =
            inventory.find(
              (entry) =>
                entry.medicineId ===
                item.medicineId,
            );

          return {
            ...item,
            supply:
              stock?.quantity ?? 0,
            stockStatus:
              stock?.stockStatus ??
              "OUT_OF_STOCK",
          };
        });

    const inventorySummary = {
      totalMedicines:
        inventory.length,

      available:
        inventory.filter(
          (item) =>
            item.stockStatus ===
            "AVAILABLE",
        ).length,

      lowStock:
        inventory.filter(
          (item) =>
            item.stockStatus ===
            "LOW_STOCK",
        ).length,

      outOfStock:
        inventory.filter(
          (item) =>
            item.stockStatus ===
            "OUT_OF_STOCK",
        ).length,

      totalUnits:
        inventory.reduce(
          (sum, item) =>
            sum + item.quantity,
          0,
        ),
    };

    return {
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
      },

      period: {
        startDate:
          startDate ?? null,
        endDate:
          endDate ?? null,
      },

      summary: {
        sales,
        totalRevenue,
        totalUnitsSold,
        averageSaleValue:
          sales > 0
            ? totalRevenue / sales
            : 0,
      },

      inventory:
        inventorySummary,

      topSelling,

      demand,
    };
  }
}