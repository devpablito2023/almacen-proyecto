import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    console.log("Entrando a productos/search");

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;


    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const limit = searchParams.get("limit") ?? "20";

    if (!q || q.length < 3) {
      return NextResponse.json(
        { success: true, message: "Query demasiado corta", data: { productos: [] } },
        { status: 200 }
      );
    }

    // 👉 tu backend real FastAPI
    const backendUrl = `${process.env.BACKEND_URL}/productos/autocomplete?q=${q}&limit=${limit}`;
    console.log("backendUrl:", backendUrl);
    const res = await fetch(backendUrl, {
      method: "GET",
      //headers: { "Content-Type": "application/json" },
      // ⚠️ Si FastAPI requiere auth (cookies, Bearer, etc.):
       //credentials: "include",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: `Error en backend: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Error en proxy productos/search:", err);
    return NextResponse.json(
      { success: false, message: "Error interno al buscar productos" },
      { status: 500 }
    );
  }
}
