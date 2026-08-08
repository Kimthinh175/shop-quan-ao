"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { reportService, RecentOrder } from "../../../../services/reportService";
import { orderService } from "../../../../services/orderService";

export interface ExtendedOrder extends RecentOrder {
  customer_email?: string;
  customer_phone?: string;
  receiver_phone?: string;
  payment_method?: string;
  payment_status?: string;
  items_count?: number;
  receiver_address?: string;
  items?: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);

  // Drag to scroll state
  const tableRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeftState, setScrollLeftState] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableRef.current.offsetLeft);
    setScrollLeftState(tableRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    tableRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Initial mock orders fallback combined with API
  const mockOrders: ExtendedOrder[] = [
    {
      _id: "ORD-9942",
      receiver_name: "Nguyễn Văn A",
      customer_email: "nv.a@gmail.com",
      customer_phone: "0901234567",
      total_amount: 4200000,
      status: "COMPLETED",
      is_pos: false,
      createdAt: "2026-07-23T10:30:00Z",
      payment_method: "VNPAY",
      items_count: 3,
      receiver_address: "123 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    },
    {
      _id: "POS-7712",
      receiver_name: "Khách lẻ tại quầy",
      customer_email: "walkin@store.vn",
      customer_phone: "N/A",
      total_amount: 1850000,
      status: "COMPLETED",
      is_pos: true,
      createdAt: "2026-07-23T14:15:00Z",
      payment_method: "Tiền mặt (Cash)",
      items_count: 2,
      receiver_address: "Bán tại cửa hàng CLOSET - Chi nhánh Q1",
    },
    {
      _id: "ORD-9943",
      receiver_name: "Trần Thị Bích",
      customer_email: "bich.tran@gmail.com",
      customer_phone: "0918889900",
      total_amount: 2950000,
      status: "SHIPPING",
      is_pos: false,
      createdAt: "2026-07-23T16:45:00Z",
      payment_method: "COD (Thanh toán khi nhận)",
      items_count: 4,
      receiver_address: "45 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
    },
    {
      _id: "ORD-9944",
      receiver_name: "Phạm Quốc Cường",
      customer_email: "cuong.pham@outlook.com",
      customer_phone: "0934567890",
      total_amount: 1200000,
      status: "PENDING",
      is_pos: false,
      createdAt: "2026-07-23T18:20:00Z",
      payment_method: "Momo",
      items_count: 1,
      receiver_address: "78 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh",
    },
    {
      _id: "ORD-9945",
      receiver_name: "Lê Hoàng Nam",
      customer_email: "nam.le@gmail.com",
      customer_phone: "0977112233",
      total_amount: 850000,
      status: "CANCELLED",
      is_pos: false,
      createdAt: "2026-07-22T09:10:00Z",
      payment_method: "COD",
      items_count: 1,
      receiver_address: "12 Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh",
    },
  ];

  const [updating, setUpdating] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({ limit: 100 });
      if (res?.data && res.data.length > 0) {
        const apiOrders: ExtendedOrder[] = res.data.map((ord: any) => ({
          _id: ord._id || ord.order_code,
          receiver_name: ord.receiver_name || ord.customer_id?.full_name || "Khách hàng",
          customer_email: ord.customer_id?.email || "N/A",
          customer_phone: ord.receiver_phone || ord.customer_id?.phone || "N/A",
          total_amount: ord.total_amount || ord.total_price || 0,
          status: ord.status || "PENDING",
          is_pos: Boolean(ord.is_pos),
          createdAt: ord.createdAt || ord.created_at || new Date().toISOString(),
          payment_method: ord.payment_method === "TRANSFER" ? "Chuyển khoản (PayOS)" : ord.payment_method === "CASH" ? "Tiền mặt (POS)" : (ord.payment_method || "COD"),
          payment_status: ord.payment_status || "UNPAID",
          items_count: ord.items?.length || 1,
          receiver_address: ord.receiver_address || "Giao tại cửa hàng / Chưa cập nhật",
          items: ord.items || [],
        }));
        setOrders(apiOrders);
      } else {
        setOrders(mockOrders);
      }
    } catch (err) {
      console.warn("Could not fetch orders from API, falling back to mock list:", err);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by tab & search query
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      String(ord._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.receiver_name && ord.receiver_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.customer_phone && ord.customer_phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return ord.status === "PENDING";
    if (activeTab === "CONFIRMED") return ord.status === "CONFIRMED";
    if (activeTab === "SHIPPING") return ord.status === "SHIPPING";
    if (activeTab === "COMPLETED") return ord.status === "COMPLETED";
    if (activeTab === "CANCELLED") return ord.status === "CANCELLED";
    if (activeTab === "ONLINE") return !ord.is_pos;
    if (activeTab === "POS") return ord.is_pos;
    return true;
  });

  // Calculate status counts
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const shippingCount = orders.filter((o) => o.status === "SHIPPING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.warn("Failed to update status on server, updating UI state:", err);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenOrderModal = async (ord: ExtendedOrder) => {
    setSelectedOrder(ord);
    setModalLoading(true);
    try {
      const res = await orderService.getOrderById(String(ord._id));
      if (res) {
        const fullOrder = res.order || res;
        const fullItems = res.items || (res.order as any)?.items || [];
        setSelectedOrder({
          ...ord,
          receiver_name: fullOrder.receiver_name || ord.receiver_name,
          receiver_phone: fullOrder.receiver_phone || ord.customer_phone,
          receiver_address: fullOrder.receiver_address || ord.receiver_address,
          total_amount: fullOrder.total_amount || fullOrder.total_price || ord.total_amount,
          status: fullOrder.status || ord.status,
          payment_method: fullOrder.payment_method || ord.payment_method,
          payment_status: fullOrder.payment_status || ord.payment_status,
          items: fullItems.length > 0 ? fullItems : ord.items,
        });
      }
    } catch (err) {
      console.warn("Could not fetch extra order details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            <i className="fa-solid fa-circle-check text-[9px]" />
            Hoàn tất
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            <i className="fa-solid fa-check-double text-[9px]" />
            Đã xác nhận
          </span>
        );
      case "SHIPPING":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            <i className="fa-solid fa-truck text-[9px]" />
            Đang giao
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            <i className="fa-solid fa-circle-xmark text-[9px]" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            <i className="fa-solid fa-clock text-[9px]" />
            Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản lý Đơn hàng
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Theo dõi, xử lý và cập nhật trạng thái đơn hàng trực tuyến và tại quầy POS.
          </p>
        </div>

        <Link
          href="/admin/pos"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
        >
          <i className="fa-solid fa-cash-register text-sm" />
          <span>Tạo đơn tại quầy (POS)</span>
        </Link>
      </div>

      {/* 4 Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-clock-rotate-left" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest whitespace-nowrap">
              Đang chờ xử lý
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-truck" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{shippingCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest whitespace-nowrap">
              Đang vận chuyển
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest whitespace-nowrap">
              Giao thành công
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-xmark" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{cancelledCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest whitespace-nowrap">
              Đã hủy đơn
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Container */}
      <div className="bg-white dark:bg-[#171717] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "Tất cả đơn" },
            { id: "PENDING", label: "Chờ xử lý" },
            { id: "CONFIRMED", label: "Đã xác nhận" },
            { id: "SHIPPING", label: "Đang giao" },
            { id: "COMPLETED", label: "Hoàn tất" },
            { id: "CANCELLED", label: "Đã hủy" },
            { id: "ONLINE", label: "Đơn Online" },
            { id: "POS", label: "Tại quầy (POS)" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã ĐH, Tên, SĐT..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      {/* Orders Table Container with Drag to Scroll */}
      <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
        <div className="px-6 py-2 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <i className="fa-solid fa-arrows-left-right text-[9px]" />
            <span>Mẹo: Nhấn giữ chuột & kéo sang trái / phải để cuộn nhanh</span>
          </span>
        </div>

        <div
          ref={tableRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto custom-scrollbar ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200/80 dark:border-slate-800">
                <th className="px-6 py-5 whitespace-nowrap">Mã đơn hàng</th>
                <th className="px-6 py-5 whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-5 whitespace-nowrap">Thanh toán</th>
                <th className="px-6 py-5 whitespace-nowrap">Tổng tiền</th>
                <th className="px-6 py-5 whitespace-nowrap">Kênh bán</th>
                <th className="px-6 py-5 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-slate-400 whitespace-nowrap">
                    <i className="fa-solid fa-circle-notch fa-spin text-lg mr-2 text-indigo-600 dark:text-[#D4AF37]" />
                    Đang nạp danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-slate-400 whitespace-nowrap">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group"
                  >
                    <td className="px-6 py-5 font-black text-indigo-600 dark:text-[#EBC563] text-sm whitespace-nowrap">
                      #{ord._id}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {ord.receiver_name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {ord.customer_phone || ord.customer_email || "Khách lẻ"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {ord.payment_method || "COD"}
                    </td>

                    <td className="px-6 py-5 font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                      {(ord.total_amount || 0).toLocaleString("vi-VN")}đ
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      {ord.is_pos ? (
                        <span className="inline-block whitespace-nowrap px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-200 dark:border-amber-800">
                          Tại quầy (POS)
                        </span>
                      ) : (
                        <span className="inline-block whitespace-nowrap px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-200 dark:border-indigo-800">
                          Website Online
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">{renderStatusBadge(ord.status)}</td>

                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenOrderModal(ord)}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-slate-950 flex items-center justify-center transition-all"
                          title="Xem chi tiết đơn hàng"
                        >
                          <i className="fa-solid fa-eye text-xs" />
                        </button>

                        <Link
                          href="/admin/invoice"
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 flex items-center justify-center transition-all"
                          title="In hóa đơn"
                        >
                          <i className="fa-solid fa-print text-xs" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl animate-scale-up space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Chi tiết đơn hàng #{selectedOrder._id}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Ngày tạo: {new Date(selectedOrder.createdAt || Date.now()).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center text-sm"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Info Sections */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">
                  Thông tin khách hàng
                </p>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {selectedOrder.receiver_name}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  SĐT: {selectedOrder.customer_phone || "Không có"}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Địa chỉ: {selectedOrder.receiver_address || "Giao tại cửa hàng"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                    Tổng tiền thanh toán
                  </p>
                  <p className="text-lg font-black text-indigo-600 dark:text-[#EBC563]">
                    {(selectedOrder.total_amount || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div>{renderStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Change Status Action */}
              {selectedOrder.status !== "COMPLETED" && selectedOrder.status !== "CANCELLED" && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">
                    Cập nhật trạng thái đơn:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "CONFIRMED")}
                          className="py-2 px-3 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs"
                        >
                          Xác nhận đơn
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "CANCELLED")}
                          className="py-2 px-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-xs"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {selectedOrder.status === "CONFIRMED" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "SHIPPING")}
                          className="py-2 px-3 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold text-xs"
                        >
                          Giao hàng
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "CANCELLED")}
                          className="py-2 px-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-xs"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {selectedOrder.status === "SHIPPING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "COMPLETED")}
                          className="py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs"
                        >
                          Hoàn tất
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "CANCELLED")}
                          className="py-2 px-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-xs"
                        >
                          Hoàn trả (Hủy)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}