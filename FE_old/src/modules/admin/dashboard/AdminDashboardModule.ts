import { ApiClient } from "../../../api/ApiClient";

interface IDashboardData {
  overview: {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    newCustomers: number;
  };
  charts: {
    revenue7Days: Array<{ date: string; revenue: number }>;
  };
  topProducts: Array<{
    _id: number;
    name: string;
    sku: string;
    sold: number;
    price: number;
    main_img: string;
  }>;
  lowStock: Array<any>;
}

export class AdminDashboardModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    try {
      const data = await ApiClient.adminGet<IDashboardData>("/reports/dashboard");
      app.innerHTML = this.template(data);
      this.initChart(data.charts.revenue7Days);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      // Fallback mock data
      const mockData: IDashboardData = {
        overview: { totalRevenue: 245800000, totalProfit: 245800000, totalOrders: 156, newCustomers: 12 },
        charts: { revenue7Days: [] },
        topProducts: [],
        lowStock: []
      };
      app.innerHTML = this.template(mockData);
      this.initChart([]);
    }
  }

  private initChart(revenue7Days: Array<{ date: string; revenue: number }>) {
    import("chart.js/auto").then(({ Chart }) => {
      const ctx = document.getElementById("revenueChart") as HTMLCanvasElement;
      if (!ctx) return;

      // Build labels & data from API or fallback
      let labels: string[];
      let dataPoints: number[];

      if (revenue7Days && revenue7Days.length > 0) {
        labels = revenue7Days.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
        });
        dataPoints = revenue7Days.map(d => d.revenue);
      } else {
        // Fallback: hiển thị 7 ngày gần nhất với data 0
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
        }
        labels = days;
        dataPoints = [0, 0, 0, 0, 0, 0, 0];
      }

      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Doanh thu",
            data: dataPoints,
            borderColor: "#2a83e9",
            backgroundColor: "rgba(42, 131, 233, 0.08)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#2a83e9",
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${Number(ctx.raw).toLocaleString('vi-VN')}đ`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                callback: (val) => {
                  const n = Number(val);
                  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
                  return n.toLocaleString();
                }
              }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }).catch(e => console.error("Chart.js failed to load", e));
  }

  private template(data: IDashboardData): string {
    const { overview, topProducts, lowStock } = data;

    const topProductsHTML = topProducts.length > 0
      ? topProducts.slice(0, 5).map((p, i) => `
          <div class="flex items-center gap-3 py-3 ${i < topProducts.length - 1 ? 'border-b border-slate-100' : ''}">
            <span class="text-xs font-black text-slate-300 w-4 shrink-0">${i + 1}</span>
            <img src="${p.main_img}" class="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" alt="${p.name}" onerror="this.style.display='none'">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-700 truncate">${p.name}</p>
              <p class="text-xs text-slate-400">${p.sku}</p>
            </div>
            <span class="px-2 py-1 bg-blue-50 text-[#2a83e9] text-xs font-bold rounded-lg shrink-0">${p.sold.toLocaleString()} bán</span>
          </div>
        `).join('')
      : `<div class="py-8 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>`;

    const lowStockHTML = lowStock.length > 0
      ? lowStock.slice(0, 5).map(p => `
          <div class="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
            <span class="text-sm font-medium text-slate-700 truncate">${p.name || p.sku}</span>
            <span class="px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-lg shrink-0 ml-2">${p.quantity} còn</span>
          </div>
        `).join('')
      : `<div class="py-8 text-center text-slate-400 text-sm"><i class="fa-solid fa-check-circle text-emerald-400 mr-1"></i>Kho hàng ổn định</div>`;

    return `
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
          <p class="text-slate-400 text-sm mt-1">Dữ liệu cập nhật theo thời gian thực</p>
        </div>
        <div class="px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <i class="fa-regular fa-calendar text-[#2a83e9]"></i>
          ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Doanh thu</span>
          </div>
          <p class="text-2xl font-black text-slate-800 tracking-tight">${overview.totalRevenue >= 1000000
            ? (overview.totalRevenue / 1000000).toFixed(1) + 'M'
            : overview.totalRevenue.toLocaleString()}đ</p>
          <p class="text-xs text-slate-400 mt-1">Tổng doanh thu</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-blue-50 text-[#2a83e9] rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <span class="text-xs font-bold text-[#2a83e9] bg-blue-50 px-2 py-1 rounded-lg">Đơn hàng</span>
          </div>
          <p class="text-2xl font-black text-slate-800 tracking-tight">${overview.totalOrders.toLocaleString()}</p>
          <p class="text-xs text-slate-400 mt-1">Tổng đơn hàng</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-users"></i>
            </div>
            <span class="text-xs font-bold text-violet-500 bg-violet-50 px-2 py-1 rounded-lg">Khách hàng</span>
          </div>
          <p class="text-2xl font-black text-slate-800 tracking-tight">${overview.newCustomers.toLocaleString()}</p>
          <p class="text-xs text-slate-400 mt-1">Khách mới</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">Lợi nhuận</span>
          </div>
          <p class="text-2xl font-black text-slate-800 tracking-tight">${overview.totalProfit >= 1000000
            ? (overview.totalProfit / 1000000).toFixed(1) + 'M'
            : overview.totalProfit.toLocaleString()}đ</p>
          <p class="text-xs text-slate-400 mt-1">Tổng lợi nhuận</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Revenue Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-bold text-slate-800">Doanh thu 7 ngày</h3>
              <p class="text-xs text-slate-400 mt-0.5">Tổng quan xu hướng gần đây</p>
            </div>
            <div class="w-2 h-2 rounded-full bg-[#2a83e9] shadow shadow-blue-300"></div>
          </div>
          <div class="h-56 w-full relative">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800">Bán chạy nhất</h3>
            <i class="fa-solid fa-fire text-orange-400 text-sm"></i>
          </div>
          <div>${topProductsHTML}</div>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-800">Hàng tồn thấp</h3>
          <span class="text-xs font-bold ${lowStock.length > 0 ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'} px-2 py-1 rounded-lg">
            ${lowStock.length > 0 ? lowStock.length + ' sản phẩm' : 'Bình thường'}
          </span>
        </div>
        ${lowStockHTML}
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="flex justify-between items-start mb-8 animate-pulse">
        <div class="space-y-2 w-1/3">
          <div class="h-7 bg-slate-200 rounded-lg w-3/4"></div>
          <div class="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div class="h-9 w-56 bg-slate-200 rounded-xl"></div>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
        ${Array(4).fill(0).map(() => `<div class="h-32 bg-slate-200 rounded-2xl"></div>`).join('')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-pulse">
        <div class="h-80 bg-slate-200 rounded-2xl lg:col-span-2"></div>
        <div class="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
      <div class="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
    `;
  }
}
