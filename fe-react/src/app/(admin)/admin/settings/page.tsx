'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export type SettingTab = 'general' | 'branding' | 'payment' | 'notifications' | 'team';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Store Manager' | 'Cashier' | 'CSKH';
  status: 'active' | 'inactive';
  lastActive: string;
}

const INITIAL_ADMIN_TEAM: AdminMember[] = [
  {
    id: 'ADM-01',
    name: 'Quản trị viên Hệ thống',
    email: 'admin@closet.vn',
    role: 'Super Admin',
    status: 'active',
    lastActive: 'Vừa xong',
  },
  {
    id: 'ADM-02',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@closet.vn',
    role: 'Store Manager',
    status: 'active',
    lastActive: '10 phút trước',
  },
  {
    id: 'ADM-03',
    name: 'Phạm Thu Trang',
    email: 'trang.pham@closet.vn',
    role: 'Cashier',
    status: 'active',
    lastActive: '2 giờ trước',
  },
  {
    id: 'ADM-04',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@closet.vn',
    role: 'CSKH',
    status: 'inactive',
    lastActive: '3 ngày trước',
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // General Store State
  const [generalConfig, setGeneralConfig] = useState({
    storeName: 'CLOSET Haute Couture',
    slogan: 'Hệ thống Thời trang & Phụ kiện Luxury Flagship',
    hotline: '1900 8888',
    email: 'contact@closet.vn',
    address: '124 Lê Lai, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    currency: 'VND (₫)',
    timezone: 'Asia/Ho_Chi_Minh (GMT+7)',
    posHours: '08:00 - 22:00',
    maintenanceMode: false,
  });

  // Branding State
  const [brandingConfig, setBrandingConfig] = useState({
    primaryColor: '#D4AF37',
    darkModeDefault: true,
    facebook: 'https://facebook.com/closethautecouture',
    instagram: 'https://instagram.com/closet.official',
    tiktok: 'https://tiktok.com/@closet_official',
    zalo: 'https://zalo.me/closet_oa',
  });

  // Payment Methods State
  const [paymentConfig, setPaymentConfig] = useState({
    posCash: true,
    vietqr: true,
    bankName: 'MBBank - Ngân hàng Quân Đội',
    accountNumber: '999988887777',
    accountHolder: 'CONG TY TNHH CLOSET LUXURY',
    momo: true,
    vnpay: true,
    posTerminalIp: '192.168.1.150:8080',
  });

  // Notifications & Zalo OA State
  const [notifConfig, setNotifConfig] = useState({
    zaloOaId: '3849201948201',
    zaloAppId: '291048102948',
    zaloSecret: '••••••••••••••••••••',
    smsGateway: 'SpeedSMS Brandname',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'no-reply@closet.vn',
    notifyOnOrderCreated: true,
    notifyOnShipping: true,
    notifyVipPromo: true,
  });

  // Team State
  const [teamMembers, setTeamMembers] = useState<AdminMember[]>(INITIAL_ADMIN_TEAM);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'CSKH' as AdminMember['role'],
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerToast('Đã lưu cấu hình hệ thống thành công!');
    }, 600);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const created: AdminMember = {
      id: `ADM-0${teamMembers.length + 1}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'active',
      lastActive: 'Vừa mời',
    };

    setTeamMembers([...teamMembers, created]);
    setShowInviteModal(false);
    setNewMember({ name: '', email: '', role: 'CSKH' });
    triggerToast(`Đã gửi lời mời quản trị cho ${created.email}`);
  };

  const tabs: Array<{ id: SettingTab; label: string; icon: string }> = [
    { id: 'general' as SettingTab, label: 'Cấu hình chung', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'branding' as SettingTab, label: 'Thương hiệu & Logo CLOSET', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'payment' as SettingTab, label: 'Phương thức thanh toán POS/Online', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'notifications' as SettingTab, label: 'Thông báo & Zalo OA', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'team' as SettingTab, label: 'Đội ngũ Admin', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 dark:bg-[#1E1E1E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-[11px] font-black tracking-widest uppercase rounded-md bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              CLOSET CONFIG
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              System Settings
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Cài Đặt Hệ Thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Quản lý cấu hình cửa hàng, phương thức thanh toán, thông báo Zalo OA & phân quyền quản trị.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a02e] rounded-2xl shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Lưu Thay Đổi
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 mb-8 border-b border-slate-200/80 dark:border-slate-800">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#171717] text-[#D4AF37] border border-slate-200/80 dark:border-slate-800 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.icon} />
              </svg>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
        {/* TAB 1: Cấu Hình Chung */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Thông Tin Cửa Hàng Flagship
              </h2>
              <p className="text-xs text-slate-400">
                Thông tin chung hiển thị trên hóa đơn POS, chứng từ và footer website CLOSET.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tên Thương Hiệu / Cửa Hàng
                </label>
                <input
                  type="text"
                  value={generalConfig.storeName}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Slogan / Khẩu Hiệu
                </label>
                <input
                  type="text"
                  value={generalConfig.slogan}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, slogan: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Hotline Hỗ Trợ VIP
                </label>
                <input
                  type="text"
                  value={generalConfig.hotline}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, hotline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email CSKH
                </label>
                <input
                  type="email"
                  value={generalConfig.email}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Địa Chỉ Cửa Hàng Flagship
                </label>
                <input
                  type="text"
                  value={generalConfig.address}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, address: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Đơn Vị Tiền Tệ
                </label>
                <input
                  type="text"
                  disabled
                  value={generalConfig.currency}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Giờ Hoạt Động POS
                </label>
                <input
                  type="text"
                  value={generalConfig.posHours}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, posHours: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Chế độ bảo trì hệ thống
                </span>
                <span className="text-xs text-slate-400">
                  Tạm ngưng nhận đơn hàng online trên trang khách hàng khi kiểm kê kho hoặc nâng cấp.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGeneralConfig({ ...generalConfig, maintenanceMode: !generalConfig.maintenanceMode })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  generalConfig.maintenanceMode ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    generalConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Thương Hiệu & Logo CLOSET */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Bộ Nhận Diện Thương Hiệu & Logo
              </h2>
              <p className="text-xs text-slate-400">
                Tùy chỉnh màu sắc chủ đạo Quiet Luxury và liên kết trang truyền thông xã hội.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Preview */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Logo Thương Hiệu
                </span>
                <div className="flex items-center justify-center p-8 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-2xl font-black tracking-widest text-[#D4AF37] font-serif">
                    CLOSET
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast('Đã chọn file logo mới')}
                  className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Tải logo mới (.PNG, .SVG)
                </button>
              </div>

              {/* Theme Settings */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Màu Sắc & Dark Mode
                </span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Màu Hoàng Kim Chủ Đạo (Hex Code)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => setBrandingConfig({ ...brandingConfig, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => setBrandingConfig({ ...brandingConfig, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Giao diện Dark Mode mặc định
                  </span>
                  <button
                    type="button"
                    onClick={() => setBrandingConfig({ ...brandingConfig, darkModeDefault: !brandingConfig.darkModeDefault })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      brandingConfig.darkModeDefault ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        brandingConfig.darkModeDefault ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                Kênh Truyền Thông Xã Hội
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Facebook Fanpage</label>
                  <input
                    type="text"
                    value={brandingConfig.facebook}
                    onChange={(e) => setBrandingConfig({ ...brandingConfig, facebook: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram Official</label>
                  <input
                    type="text"
                    value={brandingConfig.instagram}
                    onChange={(e) => setBrandingConfig({ ...brandingConfig, instagram: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Thanh Toán POS/Online */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Phương Thức Thanh Toán POS & Online
              </h2>
              <p className="text-xs text-slate-400">
                Tích hợp thanh toán QR Ngân hàng VietQR, MoMo, VNPay và cấu hình đầu đọc thẻ POS.
              </p>
            </div>

            <div className="space-y-4">
              {/* VietQR Config Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      QR
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Chuyển Khoản Ngân Hàng VietQR (Auto Reconcile)
                      </h4>
                      <p className="text-xs text-slate-400">Tự động gạch nợ đơn hàng khi nhận được tiền từ ngân hàng.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentConfig({ ...paymentConfig, vietqr: !paymentConfig.vietqr })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      paymentConfig.vietqr ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${paymentConfig.vietqr ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {paymentConfig.vietqr && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Ngân hàng thụ hưởng</label>
                      <input
                        type="text"
                        value={paymentConfig.bankName}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={paymentConfig.accountNumber}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={paymentConfig.accountHolder}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, accountHolder: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* POS Hardware Terminal */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kết Nối Máy Cà Thẻ POS (PayOS / Ingenico Terminal)
                  </h4>
                  <p className="text-xs text-slate-400">Địa chỉ IP kết nối máy quẹt thẻ tại quầy thu ngân Flagship.</p>
                </div>
                <div className="w-64">
                  <input
                    type="text"
                    value={paymentConfig.posTerminalIp}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, posTerminalIp: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Thông Báo & Zalo OA */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Tích Hợp Thông Báo & Zalo Official Account
              </h2>
              <p className="text-xs text-slate-400">
                Cấu hình ZNS (Zalo Notification Service), SMS Brandname và email xác nhận đơn hàng tự động.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zalo OA Box */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">
                    Zalo Official Account (ZNS)
                  </span>
                  <span className="px-2.5 py-1 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-bold">
                    Đã kết nối
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Zalo OA ID</label>
                  <input
                    type="text"
                    value={notifConfig.zaloOaId}
                    onChange={(e) => setNotifConfig({ ...notifConfig, zaloOaId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">App Secret Token</label>
                  <input
                    type="password"
                    value={notifConfig.zaloSecret}
                    onChange={(e) => setNotifConfig({ ...notifConfig, zaloSecret: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* SMTP Email Box */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200/60 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Email SMTP Server (SendGrid / Gmail)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={notifConfig.smtpHost}
                      onChange={(e) => setNotifConfig({ ...notifConfig, smtpHost: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Port</label>
                    <input
                      type="text"
                      value={notifConfig.smtpPort}
                      onChange={(e) => setNotifConfig({ ...notifConfig, smtpPort: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email gửi tin</label>
                  <input
                    type="email"
                    value={notifConfig.smtpUser}
                    onChange={(e) => setNotifConfig({ ...notifConfig, smtpUser: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Đội Ngũ Admin */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Danh Sách Quản Trị Viên & Nhân Viên
                </h2>
                <p className="text-xs text-slate-400">
                  Phân quyền truy cập tài khoản admin, quản lý kho & nhân viên thu ngân.
                </p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a02e] rounded-2xl shadow-md transition-all self-start sm:self-auto"
              >
                + Mời Nhân Viên
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121212] text-[11px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4">Thành Viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Vai Trò</th>
                    <th className="py-3 px-4">Hoạt Động Cuối</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {m.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold rounded-lg">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {m.lastActive}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          m.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {m.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Mời Quản Trị Viên Mới
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên nhân viên *</label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn B"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email nội bộ *</label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="nhanvien@closet.vn"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Vai trò & Quyền hạn</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none"
                >
                  <option value="Store Manager">Store Manager (Quản lý cửa hàng)</option>
                  <option value="Cashier">Cashier (Thu ngân POS)</option>
                  <option value="CSKH">CSKH & Xử lý đơn</option>
                  <option value="Super Admin">Super Admin (Toàn quyền)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-2xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a02e] rounded-2xl shadow-lg shadow-[#D4AF37]/20"
                >
                  Gửi Lời Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}