import fs from "node:fs";

import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./dist/generated/prisma/client.js";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = new URL(
    "./.env",
    import.meta.url,
  );

  const envText = fs.readFileSync(
    envPath,
    "utf8",
  );

  const match = envText.match(
    /^DATABASE_URL\s*=\s*(?:"([^"]+)"|'([^']+)'|(.+))$/m,
  );

  if (!match) {
    throw new Error(
      "DATABASE_URL was not found in backend/.env",
    );
  }

  return (
    match[1] ||
    match[2] ||
    match[3]
  ).trim();
}

const databaseUrl = getDatabaseUrl();

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

const email = "admin@smartpharma.com";
const password = "SmartPharmaAdmin123";

try {
  const passwordHash =
    await bcrypt.hash(password, 10);

  const admin =
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        passwordHash,
        role: "ADMIN",
        pharmacyId: null,
      },
    });

  console.log(
    "Admin password reset successfully.",
  );

  console.log(
    `Email: ${admin.email}`,
  );

  console.log(
    `Role: ${admin.role}`,
  );
} catch (error) {
  console.error(
    "Failed to reset admin password.",
  );

  console.error(error);

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}