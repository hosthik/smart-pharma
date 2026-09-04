import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: 1 },
  });

  if (!pharmacy) {
    throw new Error("Pharmacy #1 does not exist.");
  }

  const passwordHash = await bcrypt.hash("SmartPharma123", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "demo@smartpharma.com",
    },
    update: {
      name: "Demo Pharmacy Owner",
      passwordHash,
      role: "PHARMACY_OWNER",
      pharmacyId: 1,
    },
    create: {
      name: "Demo Pharmacy Owner",
      email: "demo@smartpharma.com",
      passwordHash,
      role: "PHARMACY_OWNER",
      pharmacyId: 1,
    },
  });

  console.log("");
  console.log("=================================");
  console.log("DEMO ACCOUNT CREATED");
  console.log("=================================");
  console.log("Email:    demo@smartpharma.com");
  console.log("Password: SmartPharma123");
  console.log("Pharmacy: #1");
  console.log("User ID:  ", user.id);
  console.log("=================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
