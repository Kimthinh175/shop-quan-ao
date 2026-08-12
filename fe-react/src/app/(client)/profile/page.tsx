'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../services/apiClient';

type TabType = 'info' | 'orders' | 'address' | 'password';

export default function ProfilePage() {
  const { user, logout, fetchMe, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Profile Update State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password Update State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
      if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user, isAuthLoading, router]);

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: 'fa-regular fa-user' },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: 'fa-solid fa-box' },
    { id: 'address', label: 'Sổ địa chỉ', icon: 'fa-solid fa-location-dot' },
    { id: 'password', label: 'Đổi mật khẩu', icon: 'fa-solid fa-lock' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      await apiClient.put('/customers/me', { full_name: fullName, email });
      setMessage({ text: 'Cập nhật thông tin thành công!', type: 'success' });
      await fetchMe();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }
    setIsUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      // In this system, the customer update API might just take the new password.
      await apiClient.put('/customers/me', { password: newPassword });
      setMessage({ text: 'Cập nhật mật khẩu thành công!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0B0B]">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0B0B0B] min-h-screen pt-8 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl mt-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <span onClick={() => router.push('/')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Trang chủ</span>
          <i className="fa-solid fa-chevron-right text-xs"></i>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Tài khoản</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full md:w-[280px] flex-shrink-0">
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
              {/* User overview */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#171717] border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar || "https://i.pravatar.cc/150?img=12"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#171717] flex items-center justify-center">
                    <i className="fa-solid fa-check text-[10px] text-white"></i>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{user.full_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.phone}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-md">
                    Thành viên
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-3">
                <nav className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'orders') {
                          router.push('/orders');
                        } else if (tab.id === 'address') {
                          router.push('/address');
                        } else {
                          setActiveTab(tab.id as TabType);
                          setMessage({ text: '', type: '' });
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`${tab.icon} w-5 text-center ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}></i>
                      {tab.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4">
                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center opacity-80"></i>
                    Đăng xuất
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors duration-300">
              
              {message.text && (
                <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                  {message.text}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Thông tin cá nhân</h2>
                  
                  <div className="flex flex-col md:flex-row gap-10">
                    <form onSubmit={handleUpdateProfile} className="flex-1 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-slate-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-slate-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số điện thoại (Không thể đổi)</label>
                        <input type="tel" value={phone} disabled className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none text-slate-500 dark:text-slate-500 cursor-not-allowed" />
                      </div>
                      <button disabled={isUpdating} type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 mt-4 disabled:opacity-70">
                        {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </form>

                    <div className="flex-shrink-0 flex flex-col items-center border-l-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-10 pt-4">
                      <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-50 dark:border-[#171717] overflow-hidden shadow-lg relative bg-indigo-50 dark:bg-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={user.avatar || "https://i.pravatar.cc/150?img=12"} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-camera text-white text-xl"></i>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center max-w-[150px]">
                        Dung lượng file tối đa 1 MB. Định dạng: .JPEG, .PNG
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="animate-fade-in max-w-md">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Đổi mật khẩu</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
                      <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-slate-800 dark:text-white" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                          <i className={`fa-regular ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-slate-800 dark:text-white" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                          <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    
                    <button disabled={isUpdating} type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 mt-2 disabled:opacity-70">
                      {isUpdating ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
