'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    street: '123 Đường Nguyễn Trãi',
    ward: 'Phường 2',
    district: 'Quận 5',
    province: 'TP. Hồ Chí Minh',
    is_default: true,
  },
  {
    id: 2,
    name: 'Nguyễn Văn An (Công ty)',
    phone: '0901234567',
    street: 'Tòa nhà Bitexco, Số 2 Hải Triều',
    ward: 'Bến Nghé',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    is_default: false,
  },
  {
    id: 3,
    name: 'Trần Thị Bình',
    phone: '0987654321',
    street: '45 Lê Duẩn',
    ward: 'Phường Thạch Thang',
    district: 'Quận Hải Châu',
    province: 'Đà Nẵng',
    is_default: false,
  }
];

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id
    })));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Breadcrumb */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="text-sm font-medium mb-2 text-slate-500">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
              <span className="mx-2"><i className="fa-solid fa-chevron-right text-xs"></i></span>
              <span className="text-slate-800">Sổ địa chỉ</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900">Sổ địa chỉ</h1>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Thêm địa chỉ mới
          </button>
        </div>

        {/* Address Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
              {addr.is_default && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center">
                  <i className="fa-solid fa-check-circle mr-1.5"></i>
                  Mặc định
                </div>
              )}
              
              <div className="flex items-start mb-4 pr-24">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4 shrink-0">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{addr.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5"><i className="fa-solid fa-phone mr-1.5 text-slate-400"></i> {addr.phone}</p>
                </div>
              </div>

              <div className="text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed">
                <p className="font-medium">{addr.street}</p>
                <p>{addr.ward}, {addr.district}, {addr.province}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {!addr.is_default && (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Chỉnh sửa">
                    <i className="fa-solid fa-pencil"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
                    title="Xóa"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thêm địa chỉ mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ tên người nhận</label>
                    <input type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                    <input type="tel" placeholder="09xxxxxxxxx" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tỉnh/Thành phố</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm bg-white">
                      <option value="">Chọn Tỉnh/Thành</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hn">Hà Nội</option>
                      <option value="dn">Đà Nẵng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quận/Huyện</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm bg-white">
                      <option value="">Chọn Quận/Huyện</option>
                      <option value="q1">Quận 1</option>
                      <option value="q3">Quận 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phường/Xã</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm bg-white">
                    <option value="">Chọn Phường/Xã</option>
                    <option value="bn">Bến Nghé</option>
                    <option value="bt">Bến Thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ cụ thể</label>
                  <input type="text" placeholder="Số nhà, Tên đường, Tòa nhà..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm" required />
                </div>

                <div className="pt-2">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                    <span className="ml-2 text-sm text-slate-600">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Lưu địa chỉ
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
