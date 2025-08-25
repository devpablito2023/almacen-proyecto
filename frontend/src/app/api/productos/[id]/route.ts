// src/app/api/productos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:7070';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/productos/${id}`, {
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
      message: data.message || 'Producto obtenido exitosamente',
    });

  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validaciones básicas para actualización
    if (body.costo_unitario !== undefined && typeof body.costo_unitario !== 'number') {
      return NextResponse.json(
        { success: false, message: 'costo_unitario debe ser un número' },
        { status: 400 }
      );
    }

    if (body.precio_referencial !== undefined && typeof body.precio_referencial !== 'number') {
      return NextResponse.json(
        { success: false, message: 'precio_referencial debe ser un número' },
        { status: 400 }
      );
    }

    if (body.stock_minimo !== undefined && body.stock_minimo < 1) {
      return NextResponse.json(
        { success: false, message: 'stock_minimo debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (body.stock_maximo !== undefined && body.stock_maximo < 1) {
      return NextResponse.json(
        { success: false, message: 'stock_maximo debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Validar que stock_maximo >= stock_minimo si ambos están presentes
    if (body.stock_minimo && body.stock_maximo && body.stock_maximo < body.stock_minimo) {
      return NextResponse.json(
        { success: false, message: 'stock_maximo debe ser mayor o igual a stock_minimo' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Error al actualizar producto' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: data.message || 'Producto actualizado exitosamente',
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Error al eliminar producto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || 'Producto eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}