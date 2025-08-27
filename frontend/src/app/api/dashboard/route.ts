// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de autenticación requerido',
        code: 401
      }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: errorData.message || `Error del servidor: ${response.status}`,
        code: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en API dashboard:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      code: 500
    }, { status: 500 });
  }
}
