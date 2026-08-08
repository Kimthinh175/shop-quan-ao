import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <h2 class="text-base font-black text-gray-900 mb-4 uppercase tracking-widest">Tổng quan</h2>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Overview Cards -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doanh thu</span>
            <span class="text-base font-black text-blue-600 leading-tight">{{ data?.overview?.totalRevenue || 0 | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn hàng</span>
            <span class="text-3xl font-black text-gray-900">{{ data?.overview?.totalOrders || 0 }}</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách mới</span>
            <span class="text-3xl font-black text-green-500">{{ data?.overview?.newCustomers || 0 }}</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lợi nhuận</span>
            <span class="text-base font-black text-gray-900 leading-tight">{{ data?.overview?.totalProfit || 0 | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="bg-white p-4 rounded-2xl border border-gray-100">
          <h3 class="text-[10px] font-black text-gray-900 mb-4 uppercase tracking-widest">Doanh thu 7 ngày gần nhất</h3>
          <div class="relative h-48 w-full">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  loading = true;
  data: any = null;

  ngOnInit() {
    this.http.get('/api/reports/dashboard').subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false;
        setTimeout(() => this.initChart(), 0);
      },
      error: () => {
        // Fallback for demo
        this.data = {
          overview: { totalRevenue: 15400000, totalOrders: 25, newCustomers: 10, totalProfit: 4500000 },
          charts: {
            revenue7Days: [
              { date: '2026-07-12', revenue: 1500000 },
              { date: '2026-07-13', revenue: 2300000 },
              { date: '2026-07-14', revenue: 1100000 },
              { date: '2026-07-15', revenue: 3500000 },
              { date: '2026-07-16', revenue: 2800000 },
              { date: '2026-07-17', revenue: 1900000 },
              { date: '2026-07-18', revenue: 2300000 }
            ]
          }
        };
        this.loading = false;
        setTimeout(() => this.initChart(), 0);
      }
    });
  }

  initChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    let labels = [];
    let dataPoints = [];

    if (this.data && this.data.charts && this.data.charts.revenue7Days) {
      labels = this.data.charts.revenue7Days.map((d: any) => {
        return new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
      });
      dataPoints = this.data.charts.revenue7Days.map((d: any) => d.revenue);
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Doanh thu',
          data: dataPoints,
          borderColor: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#000000',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return (value as number).toLocaleString('vi-VN') + 'đ';
              }
            }
          }
        }
      }
    });
  }
}
