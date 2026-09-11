import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(pharmacyId: number) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id: pharmacyId,
      },
      include: {
        subscription: true,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
    }

    const [
      totalMedicines,
      availableMedicines,
      lowStockMedicines,
      outOfStockMedicines,
      totalInventoryUnits,
      patientSearches,
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

      this.prisma.medicineSearch.count(),
    ]);

    return {
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email,
        verificationStatus:
          pharmacy.verificationStatus,
      },

      subscription: pharmacy.subscription
        ? {
            id: pharmacy.subscription.id,
            plan: pharmacy.subscription.plan,
            status: pharmacy.subscription.status,
            startDate: pharmacy.subscription.startDate,
            renewalDate: pharmacy.subscription.renewalDate,
          }
        : null,

      summary: {
        totalMedicines,
        availableMedicines,
        lowStockMedicines,
        outOfStockMedicines,
        totalInventoryUnits:
          totalInventoryUnits._sum?.quantity ?? 0,
        patientSearches,
      },
    };
  }
}