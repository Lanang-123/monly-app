import { NextRequest, NextResponse } from "next/server";

const TARGET_BASE_URL = process.env.API_URL;

if (!TARGET_BASE_URL) {
  throw new Error("API_URL is not defined in .env file");
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathJoined = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();

  let fullUrl: string;


  if (pathJoined === "auth/login") {
    fullUrl = `${TARGET_BASE_URL}/${pathJoined}${searchParams ? `?${searchParams}` : ""}`;
  } else {
    fullUrl = `${TARGET_BASE_URL}/api/${pathJoined}${searchParams ? `?${searchParams}` : ""}`;
  }


  try {
    const requestHeaders = new Headers(request.headers);
    const token = request.cookies.get("token")?.value;
    
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn("Token tidak ditemukan di cookie");
    }


    requestHeaders.set("Host", "api.monlyai.com");
    requestHeaders.set("Origin", "https://dashboard.monlyai.com");
    requestHeaders.set("Referer", "https://dashboard.monlyai.com/");
    requestHeaders.delete("host"); 

    const response = await fetch(fullUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.body, 
      // @ts-ignore
      duplex: "half", 
    });


    const data = await response.blob(); 
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

  } catch (error) {
    console.error("❌ Proxy Error:", error);
    return NextResponse.json({ 
      error: "Proxy Failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;