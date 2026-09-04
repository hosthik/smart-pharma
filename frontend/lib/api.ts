export async function searchMedicines(query: string) {
  const search = query.trim();

  if (!search) {
    return [];
  }

  const response = await fetch(
    `/api/medicines/search?q=${encodeURIComponent(search)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message ||
            `Search failed: ${response.status}`,
    );
  }

  return data;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4000";

export async function loginPharmacy(
  email: string,
  password: string,
) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function getDashboard(pharmacyId: number) {
  const response = await fetch(
    `${API_URL}/dashboard/${pharmacyId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load dashboard");
  }

  return response.json();
}