export async function getAnalytics(
pharmacyId: number,
startDate?: string,
endDate?: string,
) {
const params = new URLSearchParams();

if (startDate) {
params.set("startDate", startDate);
}

if (endDate) {
params.set("endDate", endDate);
}

const queryString = params.toString();

const response = await fetch(
`/api/analytics/${pharmacyId}${
      queryString ? `?${queryString}` : ""
    }`,
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
`Analytics request failed: ${response.status}`,
);
}

return data;
}

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
