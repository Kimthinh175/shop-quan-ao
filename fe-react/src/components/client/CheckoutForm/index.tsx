"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

export interface CheckoutFormData {
  title: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
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

  const [title, setTitle] = useState("Anh");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [note, setNote] = useState("");

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (user.full_name && !fullName) setFullName(user.full_name);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  // Derived lists for dropdowns
  const provinceList = Object.keys(LOCATION_DATA);
  const districtList = province ? Object.keys(LOCATION_DATA[province] || {}) : [];
  const wardList = (province && district) ? (LOCATION_DATA[province]?.[district] || []) : [];

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setProvince(selected);
    setDistrict("");
    setWard("");
  };

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setDistrict(selected);
    setWard("");
  };

  useEffect(() => {
    onChange?.({ title, fullName, phone, email, address, province, district, ward, note });
  }, [title, fullName, phone, email, address, province, district, ward, note]);

  return (
    <div className="card">
      <span className="section-label">Thông tin vận chuyển</span>

      <div className="space-y-4">
        {/* Title & Full Name */}
        <div className="flex gap-3">
          <select
            className="input-field"
            style={{ width: '120px', flexShrink: 0 }}
            value={title}
            onChange={e => setTitle(e.target.value)}
          >
            <option value="Anh">Anh</option>
            <option value="Chị">Chị</option>
          </select>
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

        {/* Province / District / Ward Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Province */}
          <select
            className="input-field cursor-pointer"
            value={province}
            onChange={handleProvinceChange}
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {provinceList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* District */}
          <select
            className="input-field cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={district}
            onChange={handleDistrictChange}
            disabled={!province}
          >
            <option value="">
              {province ? "-- Chọn Quận / Huyện --" : "-- Chọn Tỉnh / TP trước --"}
            </option>
            {districtList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Ward */}
          <select
            className="input-field cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={ward}
            onChange={e => setWard(e.target.value)}
            disabled={!district}
          >
            <option value="">
              {district ? "-- Chọn Phường / Xã --" : "-- Chọn Quận / Huyện trước --"}
            </option>
            {wardList.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

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
