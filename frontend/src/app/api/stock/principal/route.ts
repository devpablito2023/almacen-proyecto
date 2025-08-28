// src/app/api/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:7070';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query para filtros y paginación
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '15';
    const search = searchParams.get('search') || '';
    const tipo_producto = searchParams.get('tipo_producto') || '';
    const categoria_producto = searchParams.get('categoria_producto') || '';
    const ubicacion_fisica = searchParams.get('ubicacion_fisica') || '';
    const nivel_alerta = searchParams.get('nivel_alerta') || '';
    const con_stock = searchParams.get('con_stock');
    const sin_movimiento_dias = searchParams.get('sin_movimiento_dias');
    const fecha_desde = searchParams.get('fecha_desde') || '';
    const fecha_hasta = searchParams.get('fecha_hasta') || '';
    const sort_by = searchParams.get('sort_by') || 'producto_nombre';
    const sort_order = searchParams.get('sort_order') || 'asc';

    // Construir query params para el backend
    const backendParams = new URLSearchParams({
      page,
      limit,
      sort_by,
      sort_order,
      ...(search && { search }),
      ...(tipo_producto && { tipo_producto }),
      ...(categoria_producto && { categoria_producto }),
      ...(ubicacion_fisica && { ubicacion_fisica }),
      ...(nivel_alerta && { nivel_alerta }),
      ...(con_stock && { con_stock }),
      ...(sin_movimiento_dias && { sin_movimiento_dias }),
      ...(fecha_desde && { fecha_desde }),
      ...(fecha_hasta && { fecha_hasta })
    });

    const response = await fetch(`${BACKEND_URL}/stock/?${backendParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Error del servidor' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data.data,
      message: data.message || 'Stock obtenido exitosamente',
    });

  } catch (error) {
    console.error('Error en API stock:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

