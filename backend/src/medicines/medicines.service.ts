import {
BadRequestException,
ForbiddenException,
Injectable,
NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

type UserRole =
| "ADMIN"
| "PHARMACY_OWNER"
| "PHARMACY_STAFF";

type AuthenticatedUser = {
sub: number;
email: string;
role: UserRole;
pharmacyId: number | null;
};

type CreateMedicineBody = {
name: string;
genericName?: string;
category?: string;
pharmacyId?: number;
quantity?: number;
price?: number;
stockStatus?:
| "AVAILABLE"
| "LOW_STOCK"
| "OUT_OF_STOCK";
section?: string;
shelf?: string;
row?: string;
};

type UpdateMedicineBody = {
name?: string;
genericName?: string;
category?: string;
quantity?: number;
price?: number;
stockStatus?:
| "AVAILABLE"
| "LOW_STOCK"
| "OUT_OF_STOCK";
section?: string;
shelf?: string;
row?: string;
};

@Injectable()
export class MedicinesService {
constructor(
private readonly prisma: PrismaService,
) {}

private async checkPharmacyAccess(
pharmacyId: number,
user?: AuthenticatedUser,
) {
if (!user) {
throw new ForbiddenException(
"Authentication is required.",
);
}


if (user.role === "ADMIN") {
  return;
}

if (
  user.pharmacyId === null ||
  user.pharmacyId !== pharmacyId
) {
  throw new ForbiddenException(
    "You can only manage medicines for your own pharmacy.",
  );
}


}

private async checkActiveSubscription(
pharmacyId: number,
) {
const subscription =
await this.prisma.subscription.findUnique({
where: {
pharmacyId,
},
});


if (!subscription) {
  throw new ForbiddenException(
    "An active subscription is required for pharmacy medicine management.",
  );
}

if (subscription.status !== "ACTIVE") {
  throw new ForbiddenException(
    "Your pharmacy subscription is not active.",
  );
}

if (
  subscription.renewalDate &&
  subscription.renewalDate <= new Date()
) {
  await this.prisma.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      status: "EXPIRED",
    },
  });

  throw new ForbiddenException(
    "Your pharmacy subscription has expired.",
  );
}


}

async findAll(
pharmacyId?: number,
user?: AuthenticatedUser,
) {
if (pharmacyId !== undefined) {
await this.checkPharmacyAccess(
pharmacyId,
user,
);


  return this.prisma.medicine.findMany({
    where: {
      inventory: {
        some: {
          pharmacyId,
        },
      },
    },
    include: {
      inventory: {
        where: {
          pharmacyId,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

if (
  user &&
  user.role === "ADMIN"
) {
  return this.prisma.medicine.findMany({
    include: {
      inventory: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

if (user?.pharmacyId) {
  return this.prisma.medicine.findMany({
    where: {
      inventory: {
        some: {
          pharmacyId:
            user.pharmacyId,
        },
      },
    },
    include: {
      inventory: {
        where: {
          pharmacyId:
            user.pharmacyId,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

return this.prisma.medicine.findMany({
  orderBy: {
    name: "asc",
  },
});


}

async findOne(
id: number,
pharmacyId?: number,
user?: AuthenticatedUser,
) {
if (pharmacyId !== undefined) {
await this.checkPharmacyAccess(
pharmacyId,
user,
);
}


const medicine =
  await this.prisma.medicine.findUnique({
    where: {
      id,
    },
    include: {
      inventory: {
        include: {
          pharmacy: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
  });

if (!medicine) {
  throw new NotFoundException(
    "Medicine not found.",
  );
}

return medicine;


}

/*

* PUBLIC PATIENT SEARCH
*
* Only pharmacies that:
*
* 1. Are APPROVED
* 2. Have stock greater than zero
* 3. Have an ACTIVE subscription
* 4. Have not passed their renewal date
*
* are returned to patients.
  */
  async search(
  query: string,
  pharmacyId?: number,
  ) {
  const trimmedQuery =
  query.trim();


if (!trimmedQuery) {

  return [];
}

const now = new Date();

const activeSubscriptionFilter = {
  is: {
    status: "ACTIVE" as const,
    OR: [
      {
        renewalDate: null,
      },
      {
        renewalDate: {
          gt: now,
        },
      },
    ],
  },
};

const inventoryWhere =
  pharmacyId !== undefined
    ? {
        pharmacyId,

        quantity: {
          gt: 0,
        },

        pharmacy: {
          verificationStatus:
            "APPROVED" as const,

          subscription:
            activeSubscriptionFilter,
        },
      }
    : {
        quantity: {
          gt: 0,
        },

        pharmacy: {
          verificationStatus:
            "APPROVED" as const,

          subscription:
            activeSubscriptionFilter,
        },
      };

const medicines =
  await this.prisma.medicine.findMany({
    where: {
      OR: [
        {
          name: {
            contains:
              trimmedQuery,
            mode: "insensitive",
          },
        },
        {
          genericName: {
            contains:
              trimmedQuery,
            mode: "insensitive",
          },
        },
      ],
    },

    include: {
      inventory: {
        where: inventoryWhere,

        include: {
          pharmacy: true,
        },

        orderBy: {
          price: "asc",
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });

/*
 * Record exactly ONE public search event
 * for the patient's search request.
 */
await this.prisma.medicineSearch.create({
  data: {
    query: trimmedQuery,

    medicineId:
      medicines.length === 1
        ? medicines[0].id
        : null,
  },
});

/*
 * Remove medicine records that no longer
 * have any eligible active pharmacy.
 *
 * This prevents an empty medicine result
 * from being shown to patients.
 */
const visibleMedicines =
  medicines.filter(
    (medicine) =>
      medicine.inventory.length > 0,
  );

return visibleMedicines.map(
  (medicine) => ({
    id: medicine.id,

    name: medicine.name,

    genericName:
      medicine.genericName,

    category:
      medicine.category,

    pharmacies:
      medicine.inventory.map(
        (inventory) => ({
          pharmacyId:
            inventory.pharmacy.id,

          pharmacyName:
            inventory.pharmacy.name,

          address:
            inventory.pharmacy.address,

          phone:
            inventory.pharmacy.phone,

          quantity:
            inventory.quantity,

          price:
            inventory.price,

          stockStatus:
            inventory.stockStatus,

          section:
            inventory.section,

          shelf:
            inventory.shelf,

          row:
            inventory.row,
        }),
      ),
  }),
);


}

async create(
body: CreateMedicineBody,
user?: AuthenticatedUser,
) {
if (!user) {
throw new ForbiddenException(
"Authentication is required.",
);
}


const name =
  body.name?.trim();

if (!name) {
  throw new BadRequestException(
    "Medicine name is required.",
  );
}

const pharmacyId =
  body.pharmacyId ??
  user.pharmacyId;

if (
  pharmacyId === null ||
  pharmacyId === undefined
) {
  throw new BadRequestException(
    "A pharmacy is required.",
  );
}

await this.checkPharmacyAccess(
  pharmacyId,
  user,
);

if (user.role !== "ADMIN") {
  await this.checkActiveSubscription(
    pharmacyId,
  );
}

const medicine =
  await this.prisma.medicine.create({
    data: {
      name,

      genericName:
        body.genericName?.trim() ||
        null,

      category:
        body.category?.trim() ||
        null,
    },
  });

/*
 * Create pharmacy inventory when
 * inventory information was supplied.
 */
if (
  body.quantity !== undefined ||
  body.price !== undefined ||
  body.stockStatus !== undefined ||
  body.section !== undefined ||
  body.shelf !== undefined ||
  body.row !== undefined
) {
  const quantity =
    Math.max(
      0,
      Number(body.quantity ?? 0),
    );

  const price =
    Number(body.price ?? 0);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new BadRequestException(
      "Price must be a valid non-negative number.",
    );
  }

  await this.prisma.inventory.create({
    data: {
      pharmacyId,

      medicineId:
        medicine.id,

      quantity,

      price,

      stockStatus:
        body.stockStatus ??
        (quantity === 0
          ? "OUT_OF_STOCK"
          : quantity <= 5
            ? "LOW_STOCK"
            : "AVAILABLE"),

      section:
        body.section?.trim() ||
        null,

      shelf:
        body.shelf?.trim() ||
        null,

      row:
        body.row?.trim() ||
        null,
    },
  });
}

return this.findOne(
  medicine.id,
  pharmacyId,
  user,
);


}

async update(
id: number,
body: UpdateMedicineBody,
user?: AuthenticatedUser,
) {
if (!user) {
throw new ForbiddenException(
"Authentication is required.",
);
}


const medicine =
  await this.prisma.medicine.findUnique({
    where: {
      id,
    },
    include: {
      inventory: true,
    },
  });

if (!medicine) {
  throw new NotFoundException(
    "Medicine not found.",
  );
}

const pharmacyId =
  medicine.inventory[0]
    ?.pharmacyId ??
  user.pharmacyId;

if (
  pharmacyId === null ||
  pharmacyId === undefined
) {
  throw new BadRequestException(
    "Medicine is not associated with a pharmacy.",
  );
}

await this.checkPharmacyAccess(
  pharmacyId,
  user,
);

if (user.role !== "ADMIN") {
  await this.checkActiveSubscription(
    pharmacyId,
  );
}

const updatedMedicine =
  await this.prisma.medicine.update({
    where: {
      id,
    },

    data: {
      ...(body.name !== undefined
        ? {
            name:
              body.name.trim(),
          }
        : {}),

      ...(body.genericName !==
      undefined
        ? {
            genericName:
              body.genericName
                .trim() ||
              null,
          }
        : {}),

      ...(body.category !==
      undefined
        ? {
            category:
              body.category
                .trim() ||
              null,
          }
        : {}),
    },
  });

const inventory =
  await this.prisma.inventory.findUnique({
    where: {
      pharmacyId_medicineId: {
        pharmacyId,
        medicineId: id,
      },
    },
  });

if (inventory) {
  const nextQuantity =
    body.quantity !== undefined
      ? Math.max(
          0,
          Number(body.quantity),
        )
      : inventory.quantity;

  if (
    !Number.isFinite(
      nextQuantity,
    )
  ) {
    throw new BadRequestException(
      "Quantity must be a valid number.",
    );
  }

  const nextPrice =
    body.price !== undefined
      ? Number(body.price)
      : inventory.price;

  if (
    !Number.isFinite(
      nextPrice,
    ) ||
    nextPrice < 0
  ) {
    throw new BadRequestException(
      "Price must be a valid non-negative number.",
    );
  }

  await this.prisma.inventory.update({
    where: {
      id: inventory.id,
    },

    data: {
      quantity:
        nextQuantity,

      price:
        nextPrice,

      stockStatus:
        body.stockStatus ??
        (body.quantity !== undefined
          ? nextQuantity === 0
            ? "OUT_OF_STOCK"
            : nextQuantity <= 5
              ? "LOW_STOCK"
              : "AVAILABLE"
          : inventory.stockStatus),

      section:
        body.section !== undefined
          ? body.section.trim() ||
            null
          : inventory.section,

      shelf:
        body.shelf !== undefined
          ? body.shelf.trim() ||
            null
          : inventory.shelf,

      row:
        body.row !== undefined
          ? body.row.trim() ||
            null
          : inventory.row,
    },
  });
} else if (
  body.quantity !== undefined ||
  body.price !== undefined ||
  body.stockStatus !== undefined ||
  body.section !== undefined ||
  body.shelf !== undefined ||
  body.row !== undefined
) {
  const quantity =
    Math.max(
      0,
      Number(body.quantity ?? 0),
    );

  const price =
    Number(body.price ?? 0);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new BadRequestException(
      "Price must be a valid non-negative number.",
    );
  }

  await this.prisma.inventory.create({
    data: {
      pharmacyId,

      medicineId: id,

      quantity,

      price,

      stockStatus:
        body.stockStatus ??
        (quantity === 0
          ? "OUT_OF_STOCK"
          : quantity <= 5
            ? "LOW_STOCK"
            : "AVAILABLE"),

      section:
        body.section?.trim() ||
        null,

      shelf:
        body.shelf?.trim() ||
        null,

      row:
        body.row?.trim() ||
        null,
    },
  });
}

return updatedMedicine;


}

async remove(
id: number,
pharmacyId?: number,
user?: AuthenticatedUser,
) {
if (!user) {
throw new ForbiddenException(
"Authentication is required.",
);
}


const medicine =
  await this.prisma.medicine.findUnique({
    where: {
      id,
    },
    include: {
      inventory: true,
    },
  });

if (!medicine) {
  throw new NotFoundException(
    "Medicine not found.",
  );
}

const resolvedPharmacyId =
  pharmacyId ??
  medicine.inventory[0]
    ?.pharmacyId ??
  user.pharmacyId;

if (
  resolvedPharmacyId === null ||
  resolvedPharmacyId === undefined
) {
  throw new BadRequestException(
    "A pharmacy is required.",
  );
}

await this.checkPharmacyAccess(
  resolvedPharmacyId,
  user,
);

if (user.role !== "ADMIN") {
  await this.checkActiveSubscription(
    resolvedPharmacyId,
  );
}

await this.prisma.medicine.delete({
  where: {
    id,
  },
});

return {
  success: true,

  message:
    "Medicine deleted successfully.",
};


}
}
