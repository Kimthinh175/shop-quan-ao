'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/apiClient';
import dynamic from 'next/dynamic';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AddressMap = dynamic(() => import('@/components/AddressMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Đang tải bản đồ...</div>
});

interface Address {
  _id: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  is_default: boolean;
}

export default function AddressPage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    street_address: '',
    is_default: false
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchAddresses();
    }
  }, [user, isAuthLoading, router]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const data: any = await apiClient.get('/customers/me/addresses');
      setAddresses(data || []);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status !== 401) {
        alert('Lỗi tải danh sách địa chỉ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: 'fa-regular fa-user' },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: 'fa-solid fa-box' },
    { id: 'address', label: 'Sổ địa chỉ', icon: 'fa-solid fa-location-dot' },
    { id: 'password', label: 'Đổi mật khẩu', icon: 'fa-solid fa-lock' },
  ];
  const activeTab = 'address';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address._id);
      setFormData({
        recipient_name: address.recipient_name,
        phone: address.phone,
        street_address: address.street_address,
        is_default: address.is_default
      });
    } else {
      setEditingId(null);
      setFormData({
        recipient_name: '',
        phone: '',
        street_address: '',
        is_default: false
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await apiClient.delete(`/customers/me/addresses/${id}`);
        setAddresses(addresses.filter(addr => addr._id !== id));
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa địa chỉ');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.put(`/customers/me/addresses/${id}`, { is_default: true });
      fetchAddresses();
    } catch (err) {
      alert('Có lỗi xảy ra khi đặt mặc định');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street_address) {
      alert("Vui lòng nhập hoặc chọn địa chỉ trên bản đồ.");
      return;
    }
    
    try {
      let data: any;
      if (editingId) {
        data = await apiClient.put(`/customers/me/addresses/${editingId}`, formData);
      } else {
        data = await apiClient.post('/customers/me/addresses', formData);
      }
      setAddresses(data);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ');
    }
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
                          // Already here
                        } else {
                          router.push('/profile');
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
              
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sổ địa chỉ</h2>
                <button 
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <i className="fa-solid fa-plus mr-2"></i>
                  Thêm địa chỉ mới
                </button>
              </div>

              {/* Address Grid */}
              {isLoading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Đang tải...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Bạn chưa có địa chỉ nào.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {addresses.map(addr => (
                    <div key={addr._id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                      {addr.is_default && (
                        <div className="absolute top-0 right-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center">
                          <i className="fa-solid fa-check-circle mr-1.5"></i>
                          Mặc định
                        </div>
                      )}
                      
                      <div className="flex items-start mb-4 pr-24">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-4 shrink-0">
                          <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{addr.recipient_name}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5"><i className="fa-solid fa-phone mr-1.5 text-slate-400 dark:text-slate-500"></i> {addr.phone}</p>
                        </div>
                      </div>

                      <div className="text-slate-700 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm leading-relaxed flex-grow">
                        <p className="font-medium">{addr.street_address}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div className="flex items-center gap-2">
                          {!addr.is_default && (
                            <button 
                              onClick={() => handleSetDefault(addr._id)}
                              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1.5 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(addr)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors" 
                            title="Sửa"
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(addr._id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors" 
                            title="Xóa"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-slate-800 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Họ tên người nhận</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                      placeholder="Nguyễn Văn A" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:bg-slate-800 dark:text-white transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số điện thoại</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="09xxxxxxxxx" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:bg-slate-800 dark:text-white transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bản đồ (Click để chọn vị trí)</label>
                  <AddressMap 
                    onLocationSelect={(address) => setFormData(prev => ({...prev, street_address: address}))} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Địa chỉ cụ thể</label>
                  <textarea 
                    required 
                    value={formData.street_address}
                    onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                    placeholder="Số nhà, Tên đường, Tòa nhà (hoặc chọn trên bản đồ)..." 
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:bg-slate-800 dark:text-white transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center cursor-pointer w-fit">
                    <input 
                      type="checkbox" 
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-indigo-600" 
                    />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    {editingId ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
