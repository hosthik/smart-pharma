import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined in the environment.",
    );
  }

  console.log("======================================");
  console.log("SmartPharma Admin Setup");
  console.log("======================================");

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const passwordHash = await bcrypt.hash(
      "SmartPharmaAdmin123",
      10,
    );

    const admin = await prisma.user.upsert({
      where: {
        email: "admin@smartpharma.com",
      },

      update: {
        name: "SmartPharma Administrator",
        passwordHash,
        role: "ADMIN",
        pharmacyId: null,
      },

      create: {
        name: "SmartPharma Administrator",
        email: "admin@smartpharma.com",
        passwordHash,
        role: "ADMIN",
        pharmacyId: null,
      },
    });

    console.log("");
    console.log("Admin account created/updated successfully.");
    console.log("");
    console.log(`ID:       ${admin.id}`);
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Role:     ${admin.role}`);
    console.log("");
    console.log("Login credentials:");
    console.log("Email:    admin@smartpharma.com");
    console.log("Password: SmartPharmaAdmin123");
    console.log("");
    console.log("======================================");
  } catch (error) {
    console.error("");
    console.error("Admin setup failed.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();