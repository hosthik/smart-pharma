import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
process.env.BACKEND_API_URL ||
"http://127.0.0.1:4000";

export async function GET(
request: NextRequest,
context: {
params: Promise<{
pharmacyId: string;
}>;
},
) {
const { pharmacyId } = await context.params;

const startDate =
request.nextUrl.searchParams.get("startDate");

const endDate =
request.nextUrl.searchParams.get("endDate");

const params = new URLSearchParams();

if (startDate) {
params.set("startDate", startDate);
}

if (endDate) {
params.set("endDate", endDate);
}

const queryString = params.toString();

try {
const response = await fetch(
`${BACKEND_URL}/analytics/${encodeURIComponent(
        pharmacyId,
      )}${
        queryString ? `?${queryString}` : ""
      }`,
{
method: "GET",
cache: "no-store",
},
);


const data = await response.json();

return NextResponse.json(data, {
  status: response.status,
});


} catch (error) {
console.error(
"Analytics proxy error:",
error,
);


return NextResponse.json(
  {
    message:
      "Unable to connect to SmartPharma backend.",
  },
  {
    status: 502,
  },
);


}
}
