'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  joinedDate: string;
  address: string;
  points: number;
  lastOrderDate: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-8091',
    name: 'Trần Thị Mỹ Duyên',
    email: 'myduyen.tran@gmail.com',
    phone: '0908 123 456',
    tier: 'Diamond',
    totalOrders: 28,
    totalSpent: 64500000,
    status: 'active',
    joinedDate: '15/01/2024',
    address: 'Vinhomes Central Park, Q. Bình Thạnh, TP. HCM',
    points: 6450,
    lastOrderDate: '20/07/2026',
  },
  {
    id: 'CUST-7721',
    name: 'Nguyễn Hoàng Nam',
    email: 'hoangnam.clo@outlook.com',
    phone: '0912 987 654',
    tier: 'Gold',
    totalOrders: 16,
    totalSpent: 32800000,
    status: 'active',
    joinedDate: '02/03/2024',
    address: '124 Lê Lai, Phường Bến Thành, Quận 1, TP. HCM',
    points: 3280,
    lastOrderDate: '18/07/2026',
  },
  {
    id: 'CUST-6540',
    name: 'Lê Minh Anh',
    email: 'minhanh.fashion@gmail.com',
    phone: '0988 555 222',
    tier: 'Gold',
    totalOrders: 12,
    totalSpent: 24200000,
    status: 'active',
    joinedDate: '10/05/2024',
    address: '45 Trần Phú, Ba Đình, Hà Nội',
    points: 2420,
    lastOrderDate: '15/07/2026',
  },
  {
    id: 'CUST-5211',
    name: 'Phạm Vũ Thảo Vân',
    email: 'thaovan.pham@yahoo.com',
    phone: '0977 444 111',
    tier: 'Silver',
    totalOrders: 7,
    totalSpent: 12500000,
    status: 'active',
    joinedDate: '18/08/2024',
    address: '88 Nguyễn Huệ, Quận 1, TP. HCM',
    points: 1250,
    lastOrderDate: '09/07/2026',
  },
  {
    id: 'CUST-4120',
    name: 'Vũ Quốc Hùng',
    email: 'hung.vu@techcorp.vn',
    phone: '0933 666 888',
    tier: 'Bronze',
    totalOrders: 3,
    totalSpent: 4800000,
    status: 'active',
    joinedDate: '12/11/2024',
    address: '15 Thảo Điền, Quận 2, TP. Thủ Đức',
    points: 480,
    lastOrderDate: '01/07/2026',
  },
  {
    id: 'CUST-3902',
    name: 'Đặng Bích Ngọc',
    email: 'bichngoc.dang@gmail.com',
    phone: '0903 111 999',
    tier: 'Diamond',
    totalOrders: 34,
    totalSpent: 89000000,
    status: 'active',
    joinedDate: '04/01/2024',
    address: 'Penthouse B, Masteri Thảo Điền, TP. Thủ Đức',
    points: 8900,
    lastOrderDate: '23/07/2026',
  },
  {
    id: 'CUST-2841',
    name: 'Hoàng Gia Bảo',
    email: 'giabao.hoang@design.io',
    phone: '0944 888 333',
    tier: 'Silver',
    totalOrders: 5,
    totalSpent: 8900000,
    status: 'blocked',
    joinedDate: '22/02/2025',
    address: '202 Hoàng Văn Thụ, Q. Phú Nhuận, TP. HCM',
    points: 890,
    lastOrderDate: '10/05/2026',
  },
  {
    id: 'CUST-1928',
    name: 'Ngô Thanh Hà',
    email: 'thanhha.ngo@gmail.com',
    phone: '0966 222 777',
    tier: 'Gold',
    totalOrders: 11,
    totalSpent: 21400000,
    status: 'active',
    joinedDate: '05/04/2025',
    address: '56 Nguyễn Thị Minh Khai, Quận 3, TP. HCM',
    points: 2140,
    lastOrderDate: '12/07/2026',
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('spent');
  
  // Selected Customer for Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'Bronze' as 'Diamond' | 'Gold' | 'Silver' | 'Bronze',
    address: '',
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = customers.length;
    const vipCount = customers.filter((c) => c.tier === 'Diamond' || c.tier === 'Gold').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const activeCount = customers.filter((c) => c.status === 'active').length;
    return { totalCount, vipCount, totalRevenue, activeCount };
  }, [customers]);

  // Filter & Sort Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const matchesQuery =
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          customer.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTier = tierFilter === 'ALL' || customer.tier === tierFilter;
        const matchesStatus = statusFilter === 'ALL' || customer.status === statusFilter;

        return matchesQuery && matchesTier && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
        return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      });
  }, [customers, searchQuery, tierFilter, statusFilter, sortBy]);

  // Toggle Customer Status
  const toggleCustomerStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'active' ? 'blocked' : 'active';
          triggerToast(
            `Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản ${c.name}`
          );
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // Add Customer Submit
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      triggerToast('Vui lòng nhập Họ tên và Số điện thoại!');
      return;
    }

    const created: Customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomer.name,
      email: newCustomer.email || `${newCustomer.phone}@customer.closet`,
      phone: newCustomer.phone,
      tier: newCustomer.tier,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      address: newCustomer.address || 'Chưa cập nhật',
      points: 0,
      lastOrderDate: 'Mới đăng ký',
    };

    setCustomers([created, ...customers]);
    setShowAddModal(false);
    setNewCustomer({ name: '', email: '', phone: '', tier: 'Bronze', address: '' });
    triggerToast(`Đã thêm thành công khách hàng ${created.name}`);
  };

  const renderTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'Diamond':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-400/20 dark:to-purple-400/20 text-sky-600 dark:text-sky-300 border border-sky-400/30 dark:border-sky-400/40 text-[11px] font-bold rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 15 10-15-10-5z" />
            </svg>
            Kim Cương
          </span>
        );
      case 'Gold':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 dark:bg-[#D4AF37]/20 text-amber-700 dark:text-[#D4AF37] border border-amber-500/30 dark:border-[#D4AF37]/40 text-[11px] font-bold rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Vàng (VIP)
          </span>
        );
      case 'Silver':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[11px] font-bold rounded-full">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
            Bạc
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-600/30 text-[11px] font-medium rounded-full">
            Đồng
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 dark:bg-[#1E1E1E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-[11px] font-black tracking-widest uppercase rounded-md bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              CLOSET CRM
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              System v2.4
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Quản Lý Khách Hàng
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Hồ sơ khách hàng, phân hạng VIP & lịch sử chi tiêu thời trang cao cấp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerToast('Đang tạo file Excel danh sách khách hàng...')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất Excel
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a02e] rounded-2xl shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Thêm Khách Hàng
          </button>
        </div>
      </div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Customers */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng Khách Hàng
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stats.totalCount.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              +14.2%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.activeCount} khách hàng đang hoạt động
          </p>
        </div>

        {/* VIP Members */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Thành Viên VIP
            </span>
            <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-[#D4AF37]">
              {stats.vipCount}
            </span>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              Diamond & Gold
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Chiếm {Math.round((stats.vipCount / (stats.totalCount || 1)) * 100)}% tổng hội viên
          </p>
        </div>

        {/* Total Spent */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Doanh Thu Tích Lũy
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {stats.totalRevenue.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            TB {(stats.totalRevenue / (stats.totalCount || 1)).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫ / hội viên
          </p>
        </div>

        {/* New Members */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Thành Viên Mới
            </span>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              +128
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
              Tháng này
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Tỷ lệ quay lại mua sắm: 68.4%
          </p>
        </div>
      </div>

      {/* Filter & Controls Panel */}
      <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, Email, Số điện thoại hoặc Mã KH..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Filter Pills / Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* VIP / Tier Filter */}
            <div className="flex items-center bg-slate-50 dark:bg-[#0B0B0B] p-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider hidden sm:inline">
                Hạng:
              </span>
              {(['ALL', 'Diamond', 'Gold', 'Silver', 'Bronze'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tierFilter === tier
                      ? 'bg-white dark:bg-[#171717] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tier === 'ALL' ? 'Tất cả' : tier}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="blocked">Đã tạm khóa</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            >
              <option value="spent">Chi tiêu nhiều nhất</option>
              <option value="orders">Nhiều đơn hàng nhất</option>
              <option value="recent">Mới mua gần đây</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#121212] text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">Khách Hàng</th>
                <th className="py-4 px-6">Số Điện Thoại</th>
                <th className="py-4 px-6 text-center">Đơn Hàng</th>
                <th className="py-4 px-6">Hạng Hội Viên</th>
                <th className="py-4 px-6 text-right">Tổng Chi Tiêu</th>
                <th className="py-4 px-6 text-center">Trạng Thái</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy khách hàng phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-[#D4AF37] dark:to-amber-700 text-white dark:text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                            {customer.name}
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              ({customer.id})
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {customer.phone}
                    </td>

                    {/* Orders count */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs">
                        {customer.totalOrders} đơn
                      </span>
                    </td>

                    {/* Loyalty Tier */}
                    <td className="py-4 px-6">
                      {renderTierBadge(customer.tier)}
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white text-sm">
                      {customer.totalSpent.toLocaleString('vi-VN')} ₫
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {customer.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-extrabold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={(e) => toggleCustomerStatus(customer.id, e)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                            customer.status === 'active'
                              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                              : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                          }`}
                        >
                          {customer.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121212] flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</span> trên tổng số <span className="font-bold text-slate-900 dark:text-white">{customers.length}</span> khách hàng
          </div>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl opacity-50 cursor-not-allowed">
              Trang trước
            </button>
            <span className="px-3 py-1 font-bold text-[#D4AF37]">1</span>
            <button disabled className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl opacity-50 cursor-not-allowed">
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#121212]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    {renderTierBadge(selectedCustomer.tier)}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Mã KH: {selectedCustomer.id} • Ngày tham gia: {selectedCustomer.joinedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Customer Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tổng đơn hàng
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedCustomer.totalOrders} đơn
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chi tiêu tích lũy
                  </span>
                  <span className="text-lg font-black text-[#D4AF37]">
                    {selectedCustomer.totalSpent.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Điểm thưởng CLOSET
                  </span>
                  <span className="text-lg font-black text-sky-500">
                    {selectedCustomer.points} pts
                  </span>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block">Số điện thoại</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedCustomer.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block">Email</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedCustomer.email}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-slate-400 font-semibold block">Địa chỉ giao hàng mặc định</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0B0B] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {selectedCustomer.address}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Hoạt Động Gần Đây
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Đơn hàng mới nhất:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedCustomer.lastOrderDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-200/40 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Trạng thái tài khoản:</span>
                    <span className="font-bold text-emerald-500 uppercase">{selectedCustomer.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121212] flex justify-end gap-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded-2xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Thêm Khách Hàng Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Hạng ban đầu
                  </label>
                  <select
                    value={newCustomer.tier}
                    onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                  >
                    <option value="Bronze">Đồng</option>
                    <option value="Silver">Bạc</option>
                    <option value="Gold">Vàng (VIP)</option>
                    <option value="Diamond">Kim Cương</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="khachhang@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Nhập địa chỉ giao hàng..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-2xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a02e] rounded-2xl shadow-lg shadow-[#D4AF37]/20"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}