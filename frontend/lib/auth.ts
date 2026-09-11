export type SmartPharmaUser = {
  id: number;
  name: string;
  email: string;
  role:
    | "ADMIN"
    | "PHARMACY_OWNER"
    | "PHARMACY_STAFF";
  pharmacyId: number | null;
  pharmacyName: string | null;
};

const TOKEN_KEY = "smartpharma_token";
const USER_KEY = "smartpharma_user";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): SmartPharmaUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as SmartPharmaUser;

    if (
      !user ||
      typeof user.id !== "number" ||
      !user.name ||
      !user.email
    ) {
      return null;
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "PHARMACY_OWNER" &&
      user.role !== "PHARMACY_STAFF"
    ) {
      return null;
    }

    if (
      user.role === "ADMIN" &&
      user.pharmacyId !== null
    ) {
      return null;
    }

    if (
      user.role !== "ADMIN" &&
      (typeof user.pharmacyId !== "number" ||
        user.pharmacyId < 1)
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function getPharmacyId(): number | null {
  return getCurrentUser()?.pharmacyId ?? null;
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === "ADMIN";
}

export function isPharmacyUser(): boolean {
  const role = getCurrentUser()?.role;

  return (
    role === "PHARMACY_OWNER" ||
    role === "PHARMACY_STAFF"
  );
}

export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}