const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function searchMedicines(query: string) {
  const response = await fetch(
    `${API_URL}/medicines/search?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

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
  );

  if (!response.ok) {
    throw new Error("Unable to load dashboard");
  }

  return response.json();
}