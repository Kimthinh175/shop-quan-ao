"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../services/apiClient";

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export interface CheckoutFormProps {
  onChange?: (data: CheckoutFormData) => void;
}

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "TP. Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Đa Kao", "Phường Nguyễn Thái Bình", "Phường Tân Định"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9"],
    "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Phú Thuận", "Phường Phú Mỹ", "Phường Tân Hưng"],
    "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 15", "Phường 17", "Phường 25", "Phường 26"],
    "TP. Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Bình An", "Phường Linh Trung", "Phường Hiệp Bình Chánh"],
    "Quận Tân Bình": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 13", "Phường 15"],
    "Quận Phú Nhuận": ["Phường 1", "Phường 2", "Phường 3", "Phường 7", "Phường 9"],
    "Quận 10": ["Phường 1", "Phường 2", "Phường 4", "Phường 10", "Phường 12", "Phường 14"]
  },
  "Hà Nội": {
    "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Bồ", "Phường Hàng Đào", "Phường Hàng Gai", "Phường Tràng Tiền"],
    "Quận Ba Đình": ["Phường Cống Vị", "Phường Điện Biên", "Phường Đội Cấn", "Phường Kim Mã", "Phường Ngọc Khánh"],
    "Quận Đống Đa": ["Phường Cát Linh", "Phường Láng Hạ", "Phường Láng Thượng", "Phường Ô Chợ Dừa", "Phường Văn Miếu"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Mai Dịch", "Phường Nghĩa Tân", "Phường Trung Hòa"],
    "Quận Hai Bà Trưng": ["Phường Bách Khoa", "Phường Đồng Tâm", "Phường Lê Đại Hành", "Phường Minh Khai"]
  },
  "Đà Nẵng": {
    "Quận Hải Châu": ["Phường Bình Hiên", "Phường Hải Châu I", "Phường Hải Châu II", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam"],
    "Quận Thanh Khê": ["Phường An Khê", "Phường Chính Gián", "Phường Tân Chính", "Phường Thạc Gián"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Tây", "Phường Phước Mỹ", "Phường Thọ Quang"]
  },
  "Cần Thơ": {
    "Quận Ninh Kiều": ["Phường An Bình", "Phường An Cư", "Phường An Hòa", "Phường Cái Khế", "Phường Tân An"],
    "Quận Bình Thủy": ["Phường An Thới", "Phường Bùi Hữu Nghĩa", "Phường Bình Thủy", "Phường Trà Nóc"]
  },
  "Hải Phòng": {
    "Quận Hồng Bàng": ["Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Phan Bội Châu"],
    "Quận Ngô Quyền": ["Phường Cầu Đất", "Phường Lạch Tray", "Phường Lê Lợi"]
  },
  "Bình Dương": {
    "TP. Thủ Dầu Một": ["Phường Hiệp Thành", "Phường Phú Hòa", "Phường Phú Cường", "Phường Chánh Nghĩa"],
    "TP. Thuận An": ["Phường Lái Thiêu", "Phường An Phú", "Phường Thuận Giao"]
  },
  "Đồng Nai": {
    "TP. Biên Hòa": ["Phường Trảng Dài", "Phường Tân Phong", "Phường Trung Dũng", "Phường Quyết Thắng"],
    "Huyện Long Thành": ["Thị trấn Long Thành", "Xã An Phước", "Xã Long An"]
  }
};

export default function CheckoutForm({ onChange }: CheckoutFormProps) {
  const { user } = useAuth() || {};

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (user.full_name && !fullName) setFullName(user.full_name);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.email && !email) setEmail(user.email);

      const fetchDefaultAddress = async () => {
        try {
          const res: any = await apiClient.get('/customers/me/addresses');
          const addresses = res || [];
          const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0];
          
          if (defaultAddress) {
            setFullName(prev => prev || defaultAddress.recipient_name);
            setPhone(prev => prev || defaultAddress.phone);
            setAddress(prev => prev || defaultAddress.street_address);
          }
        } catch (err) {
          console.error('Failed to fetch addresses', err);
        }
      };

      fetchDefaultAddress();
    }
  }, [user]);

  useEffect(() => {
    onChange?.({ fullName, phone, email, address, note });
  }, [fullName, phone, email, address, note]);

  return (
    <div className="card">
      <span className="section-label">Thông tin vận chuyển</span>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="flex gap-3">
          <input
            type="text"
            className="input-field"
            placeholder="Họ và tên người nhận *"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            className="input-field"
            placeholder="Số điện thoại *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {/* Street Address */}
        <input
          type="text"
          className="input-field"
          placeholder="Địa chỉ chi tiết (số nhà, tên đường...) *"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />


        {/* Note */}
        <input
          type="text"
          className="input-field"
          placeholder="Ghi chú đơn hàng (nếu có)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </div>
  );
}
