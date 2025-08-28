import { BaseService } from "../base.service";

export interface Producto {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto?: string;
  categoria_producto?: string;
}

export interface ProductosSearchResponse {
  success: boolean;
  message: string;
  /*
  data: {
    productos: Producto[];
  };
  */
  data: Producto[];
}

class ProductosService extends BaseService {
  constructor() {
    super("productos"); // apunta a /api/productos
  }
  async search(query: string, limit = 20): Promise<Producto[]> {
    if (!query || query.length < 3) return [];
    console.log("Buscando productos con query:", query, "y limit:", limit);
    const res = await this.get<ProductosSearchResponse>(
      "/search",
      { q: query, limit }
    );
    console.log("Respuesta de search:", res);
    //return res.data.productos;
    return res.data;

  }
}

export const productosService = new ProductosService();
