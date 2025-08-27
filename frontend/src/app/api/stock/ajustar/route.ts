// src/app/api/stock/ajustar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:7070';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar campos requeridos según el esquema del backend
    const requiredFields = ['producto_id', 'cantidad_ajuste', 'motivo'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validar tipos de datos
    if (typeof body.producto_id !== 'number') {
      return NextResponse.json(
        { success: false, message: 'producto_id debe ser un número' },
        { status: 400 }
      );
    }

    if (typeof body.cantidad_ajuste !== 'number' || body.cantidad_ajuste === 0) {
      return NextResponse.json(
        { success: false, message: 'cantidad_ajuste debe ser un número diferente de cero' },
        { status: 400 }
      );
    }

    if (typeof body.motivo !== 'string' || body.motivo.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'motivo debe ser un texto no vacío' },
        { status: 400 }
      );
    }

    // Preparar datos para el backend (solo los campos que el backend espera)
    const backendData: any = {
      producto_id: body.producto_id,
      cantidad_ajuste: body.cantidad_ajuste,
      motivo: body.motivo.trim(),
    };

    // Agregar campos opcionales si existen
    if (body.ubicacion && typeof body.ubicacion === 'string') {
      backendData.ubicacion = body.ubicacion.trim();
    }
    if (body.lote_serie && typeof body.lote_serie === 'string') {
      backendData.lote_serie = body.lote_serie.trim();
    }

    const response = await fetch(`${BACKEND_URL}/stock/ajustar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Error al realizar ajuste de stock' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: data.message || 'Ajuste de stock realizado exitosamente',
    });

  } catch (error) {
    console.error('Error en API stock ajustar:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
