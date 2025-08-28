import { BaseService } from "../base.service";
import type { 
  StockResponse, 
  StockAjuste, 
  StockAjusteResponse, 
  StockExportResponse
} from "@/types/stock";

class StockService extends BaseService {
  constructor() {
    super("stock");
  }

  async getAll(filters?: any): Promise<StockResponse> {
    const params = new URLSearchParams(filters || {}).toString();
    return this.request<StockResponse>(`?${params}`);
  }

  async adjust(data: StockAjuste): Promise<StockAjusteResponse> {
    return this.request<StockAjusteResponse>("/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async export(filters?: any): Promise<StockExportResponse> {
    const params = new URLSearchParams(filters || {}).toString();
    return this.request<StockExportResponse>(`/export?${params}`);
  }
}

export const stockService = new StockService();
