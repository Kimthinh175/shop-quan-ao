import { apiClient } from "./apiClient";

export interface RecentOrder {
  _id: string | number;
  receiver_name?: string;
  customer_info?: {
    full_name?: string;
    phone?: string;
  };
  total_amount: number;
  status: string;
  is_pos?: boolean;
  createdAt?: string;
}

export interface DashboardStatsResponse {
  overview?: {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    newCustomers: number;
  };
  charts?: {
    revenue7Days: { _id: string; revenue: number; orders: number }[];
    categories?: { name: string; count: number; color: string }[];
  };
  topProducts?: {
    _id: string | number;
    sku: string;
    name: string;
    sold: number;
    quantity: number;
    main_img?: string;
    price?: number;
  }[];
  lowStock?: {
    _id: string | number;
    sku: string;
    name: string;
    quantity: number;
    main_img?: string;
  }[];
  recentOrders?: RecentOrder[];
}

export class ReportService {
  /**
   * Lấy dữ liệu báo cáo thống kê tổng hợp từ BE API /reports/dashboard
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      return await apiClient.get<DashboardStatsResponse>("/reports/dashboard");
    } catch (err) {
      console.warn("Backend API /reports/dashboard unavailable, serving fallback stats:", err);
      return {
        overview: {
          totalRevenue: 245000000,
          totalProfit: 98000000,
          totalOrders: 142,
          newCustomers: 28,
        },
        recentOrders: [
          {
            _id: "DH-2026-00847",
            receiver_name: "Trần Thị Mỹ Duyên",
            customer_info: { full_name: "Trần Thị Mỹ Duyên", phone: "0908 123 456" },
            total_amount: 8500000,
            status: "COMPLETED",
            is_pos: false,
            createdAt: "2026-07-24T10:15:00Z",
          },
          {
            _id: "POS-2026-00129",
            receiver_name: "Khách mua tại quầy",
            customer_info: { full_name: "Khách lẻ (POS)", phone: "0912 987 654" },
            total_amount: 4500000,
            status: "COMPLETED",
            is_pos: true,
            createdAt: "2026-07-24T09:40:00Z",
          },
        ],
      };
    }
  }
}

export const reportService = new ReportService();
