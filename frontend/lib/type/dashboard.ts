export interface DashboardData {
  pharmacy: {
    id: number;
    name: string;
  };

  inventory: {
    totalMedicines: number;
    available: number;
    lowStock: number;
    outOfStock: number;
  };

  sales: {
    totalSales: number;
    totalRevenue: number;
  };

  subscription?: {
    plan: string;
    status: string;
    renewalDate?: string;
  };
};

// export interface TopSellingMedicine {
//   medicineId: number;
//   medicineName: string;
//   quantitySold: number;
//   revenue: number;
// }