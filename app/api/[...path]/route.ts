import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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
  
  const searchParams = request.nextUrl.searchParams;
  searchParams.set("_ts", Date.now().toString()); 
  const queryString = searchParams.toString();
  
  let fullUrl: string;
  
  if (pathJoined.startsWith("auth")) {
     fullUrl = `${TARGET_BASE_URL}/${pathJoined}?${queryString}`;
  } else {
     fullUrl = `${TARGET_BASE_URL}/api/${pathJoined}?${queryString}`;
  }

  try {
    const requestHeaders = new Headers(request.headers);
    const token = request.cookies.get("token")?.value;
    
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    requestHeaders.set("Host", "api.monlyai.com");
    requestHeaders.set("Origin", "https://dashboard.monlyai.com");
    requestHeaders.set("Referer", "https://dashboard.monlyai.com/");
    requestHeaders.delete("host"); 

    requestHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    requestHeaders.set("Pragma", "no-cache");

    const response = await fetch(fullUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.body, 
      // @ts-ignore
      duplex: "half", 
      cache: "no-store", 
    });

    const data = await response.blob(); 
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    newHeaders.set("Pragma", "no-cache");
    newHeaders.set("Expires", "0");
    newHeaders.delete("ETag");

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
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