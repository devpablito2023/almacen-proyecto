// src/app/api/stock/export/route.ts
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

    // Obtener parámetros de filtros para exportación
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tipo_producto = searchParams.get('tipo_producto') || '';
    const categoria_producto = searchParams.get('categoria_producto') || '';
    const ubicacion_fisica = searchParams.get('ubicacion_fisica') || '';
    const nivel_alerta = searchParams.get('nivel_alerta') || '';
    const con_stock = searchParams.get('con_stock');
    const fecha_desde = searchParams.get('fecha_desde') || '';
    const fecha_hasta = searchParams.get('fecha_hasta') || '';

    // Construir query params para el backend
    const backendParams = new URLSearchParams({
      ...(search && { search }),
      ...(tipo_producto && { tipo_producto }),
      ...(categoria_producto && { categoria_producto }),
      ...(ubicacion_fisica && { ubicacion_fisica }),
      ...(nivel_alerta && { nivel_alerta }),
      ...(con_stock && { con_stock }),
      ...(fecha_desde && { fecha_desde }),
      ...(fecha_hasta && { fecha_hasta })
    });

    const response = await fetch(`${BACKEND_URL}/stock/export?${backendParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Error al exportar stock' },
        { status: response.status }
      );
    }

    // Obtener el blob del archivo Excel
    const blob = await response.blob();
    
    // Crear la respuesta con el archivo
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="stock_report.xlsx"',
      },
    });

  } catch (error) {
    console.error('Error exporting stock:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}