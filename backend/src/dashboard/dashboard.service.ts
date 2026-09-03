import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(pharmacyId: number) {
    const [
      medicineCount,
      availableCount,
      lowStockCount,
      outOfStockCount,
      sales,
      topSelling,
      topDemand,
      pharmacy,
      subscription,
    ] = await Promise.all([
      this.prisma.inventory.count({
        where: { pharmacyId },
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

      this.prisma.sale.aggregate({
        where: { pharmacyId },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      this.prisma.saleItem.groupBy({
        by: ["medicineId"],
        where: {
          sale: {
            pharmacyId,
          },
        },
        _sum: {
          quantity: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),

      this.prisma.medicineSearch.groupBy({
        by: ["medicineId"],
        where: {
          pharmacyId,
        },
        _count: {
          medicineId: true,
        },
        orderBy: {
          _count: {
            medicineId: "desc",
          },
        },
        take: 5,
      }),

      this.prisma.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },
      }),

      this.prisma.subscription.findUnique({
        where: {
          pharmacyId,
        },
      }),
    ]);

    const topSellingWithNames = await Promise.all(
      topSelling.map(async (item) => {
        const medicine = await this.prisma.medicine.findUnique({
          where: {
            id: item.medicineId,
          },
        });

        return {
          medicine: medicine?.name,
          quantity: item._sum.quantity ?? 0,
          revenue: item._sum.totalPrice ?? 0,
        };
      }),
    );

    const demandWithNames = await Promise.all(
      topDemand.map(async (item) => {
        const medicine = await this.prisma.medicine.findUnique({
          where: {
            id: item.medicineId,
          },
        });

        const inventory = await this.prisma.inventory.findUnique({
          where: {
            pharmacyId_medicineId: {
              pharmacyId,
              medicineId: item.medicineId,
            },
          },
        });

        return {
          medicine: medicine?.name,
          searches: item._count.medicineId,
          supply: inventory?.quantity ?? 0,
          stockStatus: inventory?.stockStatus ?? "OUT_OF_STOCK",
        };
      }),
    );

    return {
      pharmacy: {
        id: pharmacy?.id,
        name: pharmacy?.name,
      },

      summary: {
        medicines: medicineCount,
        available: availableCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalSales: sales._count.id,
        totalRevenue: sales._sum.totalAmount ?? 0,
      },

      topSelling: topSellingWithNames,

      demand: demandWithNames,

      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            renewalDate: subscription.renewalDate,
          }
        : null,
    };
  }
}