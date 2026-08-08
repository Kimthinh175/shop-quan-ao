'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { productService } from '../../../../services/productService';

// Types
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  color: string;
  size: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  warehouse: string;
  lastUpdated: string;
  image: string;
  rawVariants?: any[];
}

interface StockReceipt {
  id: string;
  sku: string;
  productName: string;
  variantInfo: string;
  type: string;
  quantity: number;
  date: string;
  status: 'Đã nhập' | 'Chờ xác nhận' | 'Đang vận chuyển';
  iconClass: string;
  colorClass: string;
}

// Initial Mock Data
const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    sku: 'SUIT-NV-48',
    name: 'Classic Midnight Suit',
    category: 'Bộ Vest',
    color: 'Navy Blue',
    size: '48 (M)',
    costPrice: 4200000,
    sellingPrice: 8500000,
    quantity: 45,
    minStock: 10,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '24/07/2026 09:30',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-002',
    sku: 'KNIT-MB-L',
    name: 'Merino Wool Knitwear',
    category: 'Áo Wool',
    color: 'Charcoal Grey',
    size: '50 (L)',
    costPrice: 1450000,
    sellingPrice: 2950000,
    quantity: 8,
    minStock: 10,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '24/07/2026 10:15',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-003',
    sku: 'COAT-CB-48',
    name: 'Heritage Wool Overcoat',
    category: 'Áo Khoác',
    color: 'Camel Brown',
    size: '48 (M)',
    costPrice: 6800000,
    sellingPrice: 12500000,
    quantity: 4,
    minStock: 10,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '23/07/2026 16:45',
    image: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-004',
    sku: 'SHIRT-EG-39',
    name: 'Egyptian Cotton Shirt',
    category: 'Áo Sơ Mi',
    color: 'Crisp White',
    size: '39 (S)',
    costPrice: 850000,
    sellingPrice: 1850000,
    quantity: 120,
    minStock: 15,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '24/07/2026 11:00',
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-005',
    sku: 'TROUSER-WO-48',
    name: 'Pleated Wool Trousers',
    category: 'Quần Âu',
    color: 'Midnight Black',
    size: '48 (M)',
    costPrice: 1600000,
    sellingPrice: 3200000,
    quantity: 0,
    minStock: 10,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '22/07/2026 14:20',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-006',
    sku: 'SHOES-OX-41',
    name: 'Italian Oxford Shoes',
    category: 'Phụ Kiện',
    color: 'Espresso Brown',
    size: '41',
    costPrice: 3500000,
    sellingPrice: 6900000,
    quantity: 18,
    minStock: 5,
    warehouse: 'Kho TP. Hồ Chí Minh',
    lastUpdated: '24/07/2026 08:10',
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-007',
    sku: 'BELT-LE-100',
    name: 'Calfskin Leather Belt',
    category: 'Phụ Kiện',
    color: 'Black Gold',
    size: '100cm',
    costPrice: 650000,
    sellingPrice: 1450000,
    quantity: 65,
    minStock: 10,
    warehouse: 'Kho Tổng Hà Nội',
    lastUpdated: '21/07/2026 17:30',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'INV-008',
    sku: 'BLAZER-LN-50',
    name: 'Linen Summer Blazer',
    category: 'Bộ Vest',
    color: 'Sand Beige',
    size: '50 (L)',
    costPrice: 2900000,
    sellingPrice: 5800000,
    quantity: 3,
    minStock: 10,
    warehouse: 'Kho TP. Hồ Chí Minh',
    lastUpdated: '24/07/2026 12:00',
    image: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

const INITIAL_RECEIPTS: StockReceipt[] = [
  {
    id: 'PN-2026-0012',
    sku: 'SUIT-NV-48',
    productName: 'Classic Midnight Suit',
    variantInfo: 'Navy Blue · 5 size',
    type: 'Full size',
    quantity: 120,
    date: '22/05/2026',
    status: 'Đã nhập',
    iconClass: 'fa-solid fa-ruler-combined',
    colorClass: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'PN-2026-0011',
    sku: 'KNIT-MB-L',
    productName: 'Merino Wool Knitwear',
    variantInfo: 'Size M · 3 màu',
    type: 'Full màu',
    quantity: 90,
    date: '20/05/2026',
    status: 'Đã nhập',
    iconClass: 'fa-solid fa-palette',
    colorClass: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 'PN-2026-0010',
    sku: 'COAT-CB-48',
    productName: 'Heritage Wool Overcoat',
    variantInfo: 'Camel Brown · 4 size',
    type: 'Full size',
    quantity: 60,
    date: '15/05/2026',
    status: 'Chờ xác nhận',
    iconClass: 'fa-solid fa-boxes-packing',
    colorClass: 'text-indigo-500 bg-indigo-500/10',
  },
];

export default function Page() {
  // State
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [receipts, setReceipts] = useState<StockReceipt[]>(INITIAL_RECEIPTS);
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts'>('inventory');

  // Load Inventory from API
  useEffect(() => {
    async function loadInventoryFromAPI() {
      try {
        const res = await productService.getProducts({ limit: 100 });
        const rawList = res?.results || res?.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: InventoryItem[] = rawList.map((p: any, idx: number) => {
            const stockQty = p.stock ?? (p.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 20);
            const firstVariant = p.variants?.[0] || {};
            const catName = Array.isArray(p.category) && p.category[0]?.name ? p.category[0].name : (typeof p.category === 'string' ? p.category : 'Sản Phẩm');
            
            return {
              id: String(p._id || p.id || `INV-${idx + 1}`),
              sku: firstVariant.sku || p.sku || `SKU-${100 + idx}`,
              name: p.name || 'Sản phẩm CLOSET',
              category: catName,
              color: firstVariant.color || 'Xanh Navy',
              size: firstVariant.size || 'M (48)',
              costPrice: Math.round((p.default_price || 2000000) * 0.5),
              sellingPrice: p.default_price || 2000000,
              quantity: stockQty,
              minStock: 10,
              warehouse: 'Kho Tổng Hà Nội',
              lastUpdated: new Date().toLocaleDateString('vi-VN'),
              image: p.main_img || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
              rawVariants: p.variants || [],
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.warn('Failed to load inventory from API, using fallback:', err);
      }
    }
    loadInventoryFromAPI();
  }, []);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockLevel, setSelectedStockLevel] = useState('ALL'); // ALL, OUT, LOW, IN

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<InventoryItem | null>(null);

  // Import Modal Form State
  const [importSku, setImportSku] = useState('');
  const [importQty, setImportQty] = useState<number>(10);
  const [importUnitCost, setImportUnitCost] = useState<number>(1000000);
  const [importSupplier, setImportSupplier] = useState('Loro Piana Italia');
  const [importNotes, setImportNotes] = useState('');

  // Adjustment Modal Form State
  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustVariantSku, setAdjustVariantSku] = useState('');
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('Kiểm kê định kỳ');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Extract Categories
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ['ALL', ...cats];
  }, [items]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalInventory = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length;
    const outOfStockCount = items.filter((i) => i.quantity === 0).length;
    const totalValue = items.reduce((acc, curr) => acc + curr.quantity * curr.costPrice, 0);
    const totalItems = items.length;

    return {
      totalInventory,
      lowStockCount,
      outOfStockCount,
      totalValue,
      totalItems,
    };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      const kw = searchKeyword.trim().toLowerCase();
      const matchesSearch =
        !kw ||
        item.name.toLowerCase().includes(kw) ||
        item.sku.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw) ||
        item.color.toLowerCase().includes(kw);

      // Category
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      // Stock Level
      let matchesStock = true;
      if (selectedStockLevel === 'OUT') matchesStock = item.quantity === 0;
      else if (selectedStockLevel === 'LOW') matchesStock = item.quantity > 0 && item.quantity <= item.minStock;
      else if (selectedStockLevel === 'IN') matchesStock = item.quantity > item.minStock;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchKeyword, selectedCategory, selectedStockLevel]);

  // Handlers
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSku) {
      showToast('Vui lòng chọn hoặc nhập mã SKU sản phẩm!');
      return;
    }
    if (importQty <= 0) {
      showToast('Số lượng nhập phải lớn hơn 0');
      return;
    }

    const targetItem = items.find(
      (i) => i.sku.toLowerCase() === importSku.toLowerCase() || i.id === importSku
    );

    if (targetItem) {
      const newQty = targetItem.quantity + importQty;
      const dateStr = new Date().toLocaleDateString('vi-VN');

      // Call Real API to persist stock in DB
      try {
        await productService.updateProduct(targetItem.id, {
          stock: newQty,
        });
      } catch (err) {
        console.warn('Import stock API error:', err);
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === targetItem.id
            ? {
                ...i,
                quantity: newQty,
                lastUpdated: `${dateStr} vừa xong`,
              }
            : i
        )
      );

      // Add receipt
      const newReceipt: StockReceipt = {
        id: `PN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: targetItem.sku,
        productName: targetItem.name,
        variantInfo: `${targetItem.color} · ${targetItem.size}`,
        type: 'Nhập bổ sung',
        quantity: importQty,
        date: dateStr,
        status: 'Đã nhập',
        iconClass: 'fa-solid fa-file-import',
        colorClass: 'text-emerald-500 bg-emerald-500/10',
      };
      setReceipts((prev) => [newReceipt, ...prev]);

      showToast(`Đã nhập kho thành công ${importQty} đơn vị cho ${targetItem.name}!`);
    } else {
      showToast(`Đã ghi nhận phiếu nhập kho mới cho mã SKU: ${importSku}`);
    }

    setIsImportModalOpen(false);
    setImportSku('');
    setImportQty(10);
    setImportNotes('');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId) {
      showToast('Vui lòng chọn mặt hàng cần điều chỉnh!');
      return;
    }

    const targetItem = items.find((i) => i.id === adjustItemId);
    if (!targetItem) return;

    let updatedVariants: any[] = [];
    let newTotalQty = 0;

    // Check if we are adjusting a specific variant SKU
    if (adjustVariantSku) {
      const baseVariants = targetItem.rawVariants?.length
        ? targetItem.rawVariants
        : [
            { sku: `${targetItem.sku}-S`, color: targetItem.color, size: 'S (46)', price: targetItem.sellingPrice, quantity: Math.max(0, Math.floor(targetItem.quantity * 0.2)) },
            { sku: `${targetItem.sku}-M`, color: targetItem.color, size: 'M (48)', price: targetItem.sellingPrice, quantity: Math.max(0, Math.floor(targetItem.quantity * 0.5)) },
            { sku: `${targetItem.sku}-L`, color: targetItem.color, size: 'L (50)', price: targetItem.sellingPrice, quantity: Math.max(0, Math.floor(targetItem.quantity * 0.3)) },
          ];

      updatedVariants = baseVariants.map((v: any) => {
        const vSku = v.sku || `${targetItem.sku}-${v.size || 'M'}`;
        if (vSku === adjustVariantSku || v.sku === adjustVariantSku) {
          let vQty = v.quantity ?? v.stock ?? 10;
          if (adjustType === 'ADD') vQty += adjustAmount;
          else if (adjustType === 'SUBTRACT') vQty = Math.max(0, vQty - adjustAmount);
          else if (adjustType === 'SET') vQty = Math.max(0, adjustAmount);
          return { ...v, quantity: vQty, stock: vQty };
        }
        return v;
      });

      newTotalQty = updatedVariants.reduce((sum: number, v: any) => sum + (v.quantity ?? v.stock ?? 0), 0);
    } else {
      // Product-level adjustment
      newTotalQty = targetItem.quantity;
      if (adjustType === 'ADD') newTotalQty += adjustAmount;
      else if (adjustType === 'SUBTRACT') newTotalQty = Math.max(0, newTotalQty - adjustAmount);
      else if (adjustType === 'SET') newTotalQty = Math.max(0, adjustAmount);

      updatedVariants = targetItem.rawVariants?.length
        ? targetItem.rawVariants.map((v: any) => ({ ...v, quantity: Math.max(0, Math.floor(newTotalQty / targetItem.rawVariants!.length)) }))
        : [{ sku: targetItem.sku, price: targetItem.sellingPrice, quantity: newTotalQty }];
    }

    const dateStr = new Date().toLocaleDateString('vi-VN');

    // Call Real API to persist stock adjustment in Database
    try {
      await productService.updateProduct(targetItem.id, {
        stock: newTotalQty,
        variants: updatedVariants,
      });
    } catch (err) {
      console.warn('Update stock API error:', err);
    }

    // Update main inventory items state
    setItems((prev) =>
      prev.map((i) =>
        i.id === adjustItemId
          ? {
              ...i,
              quantity: newTotalQty,
              rawVariants: updatedVariants,
              lastUpdated: `${dateStr} vừa xong`,
            }
          : i
      )
    );

    // If modal of variants is open, update selectedVariantProduct in real-time
    if (selectedVariantProduct && selectedVariantProduct.id === adjustItemId) {
      setSelectedVariantProduct((prev) =>
        prev
          ? {
              ...prev,
              quantity: newTotalQty,
              rawVariants: updatedVariants,
            }
          : null
      );
    }

    const targetLabel = adjustVariantSku ? `biến thể [${adjustVariantSku}]` : targetItem.name;
    showToast(`Đã điều chỉnh tồn kho cho ${targetLabel} (${adjustReason})`);
    setIsAdjustModalOpen(false);
    setAdjustItemId('');
    setAdjustVariantSku('');
    setAdjustNotes('');
  };

  const handleExportReport = () => {
    const headers = ['Mã ID', 'Mã SKU', 'Tên sản phẩm', 'Danh mục', 'Màu sắc', 'Kích cỡ', 'Giá nhập (VNĐ)', 'Giá bán (VNĐ)', 'Tồn kho', 'Mức tối thiểu', 'Trạng thái', 'Kho'];
    const rows = filteredItems.map((i) => {
      let status = 'Còn hàng';
      if (i.quantity === 0) status = 'Hết hàng';
      else if (i.quantity <= i.minStock) status = 'Sắp hết hàng';

      return [
        i.id,
        i.sku,
        `"${i.name}"`,
        i.category,
        i.color,
        i.size,
        i.costPrice,
        i.sellingPrice,
        i.quantity,
        i.minStock,
        status,
        `"${i.warehouse}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_ton_kho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất báo cáo tồn kho (CSV) thành công!');
  };

  const openAdjustForSingleItem = (item: InventoryItem) => {
    setAdjustItemId(item.id);
    setAdjustVariantSku('');
    setAdjustType('SET');
    setAdjustAmount(item.quantity);
    setIsAdjustModalOpen(true);
  };

  const openAdjustForVariant = (item: InventoryItem, variantSku: string, currentVariantStock: number) => {
    setAdjustItemId(item.id);
    setAdjustVariantSku(variantSku);
    setAdjustType('SET');
    setAdjustAmount(currentVariantStock);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans transition-colors duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-300/50 animate-bounce">
          <i className="fa-solid fa-circle-check text-amber-400 dark:text-amber-600 text-lg"></i>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <i className="fa-solid fa-boxes-stacked text-xl"></i>
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Quản Lý Tồn Kho
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Theo dõi hàng tồn kho, phiếu nhập và điều chỉnh số lượng theo chuẩn Quiet Luxury
              </p>
            </div>
          </div>
        </div>

        {/* Quiet Luxury Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-600/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Nhập kho mới</span>
          </button>

          <button
            onClick={() => {
              if (items.length > 0) setAdjustItemId(items[0].id);
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 font-semibold text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-sliders text-amber-500 text-xs"></i>
            <span>Điều chỉnh tồn kho</span>
          </button>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-white dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 font-semibold text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-file-export text-slate-400 text-xs"></i>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: Total Inventory */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng tồn kho
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <i className="fa-solid fa-warehouse text-emerald-600 dark:text-emerald-400 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {stats.totalInventory.toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">●</span> sản phẩm sẵn có
          </p>
        </div>

        {/* Card 2: Low Stock Warning */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sắp hết hàng
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <i className="fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-400 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {stats.lowStockCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            tồn ≤ ngưỡng định mức
          </p>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Hết hàng
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <i className="fa-solid fa-box-open text-rose-600 dark:text-rose-400 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.outOfStockCount}
          </p>
          <p className="text-xs text-rose-500/80 dark:text-rose-400/80 font-bold mt-1">
            cần bổ sung gấp
          </p>
        </div>

        {/* Card 4: Total Warehouse Value */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Giá trị kho
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <i className="fa-solid fa-coins text-indigo-600 dark:text-indigo-400 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {(stats.totalValue / 1000000000).toFixed(2)}B
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {stats.totalValue.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>

        {/* Card 5: Inventory Items */}
        <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mặt hàng SKU
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <i className="fa-solid fa-barcode text-purple-600 dark:text-purple-400 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {stats.totalItems}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            thuộc {categoriesList.length - 1} danh mục
          </p>
        </div>
      </div>

      {/* Tabs & Controls Section */}
      <div className="bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#121212] p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 self-start">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-[#171717] text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-boxes-packing text-xs"></i>
              <span>Danh sách tồn kho</span>
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                {filteredItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'receipts'
                  ? 'bg-white dark:bg-[#171717] text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-receipt text-xs"></i>
              <span>Lịch sử nhập kho</span>
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black">
                {receipts.length}
              </span>
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {/* Search input */}
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm, SKU..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 text-xs md:text-sm border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder-slate-400 transition-all"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 text-xs md:text-sm border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="ALL" className="bg-white dark:bg-[#171717]">
                    Tất cả danh mục
                  </option>
                  {categoriesList
                    .filter((c) => c !== 'ALL')
                    .map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-[#171717]">
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Stock Status Dropdown */}
              <div>
                <select
                  value={selectedStockLevel}
                  onChange={(e) => setSelectedStockLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 text-xs md:text-sm border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="ALL" className="bg-white dark:bg-[#171717]">
                    Tất cả trạng thái
                  </option>
                  <option value="IN" className="bg-white dark:bg-[#171717]">
                    Còn hàng (&gt; định mức)
                  </option>
                  <option value="LOW" className="bg-white dark:bg-[#171717]">
                    Sắp hết hàng (≤ định mức)
                  </option>
                  <option value="OUT" className="bg-white dark:bg-[#171717]">
                    Hết hàng (0 đơn vị)
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Interactive Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="mt-6">
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#121212] border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Mã SKU / SP</th>
                    <th className="py-3.5 px-4">Sản phẩm</th>
                    <th className="py-3.5 px-4 text-right">Giá vốn</th>
                    <th className="py-3.5 px-4 text-right">Giá bán</th>
                    <th className="py-3.5 px-4 text-center">Tồn kho</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Kho lưu trữ</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <i className="fa-solid fa-box-open text-3xl mb-2 block text-slate-300 dark:text-slate-600"></i>
                        <span>Không tìm thấy mặt hàng nào phù hợp với bộ lọc</span>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isOut = item.quantity === 0;
                      const isLow = item.quantity > 0 && item.quantity <= item.minStock;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedVariantProduct(item)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150 group cursor-pointer"
                        >
                          {/* SKU */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                              {item.sku}
                            </span>
                          </td>

                          {/* Product Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 flex-shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  <span className="font-semibold text-slate-600 dark:text-slate-300">{item.category}</span>
                                  <span>•</span>
                                  <span>{item.color}</span>
                                  <span>•</span>
                                  <span>{item.size}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {item.costPrice.toLocaleString('vi-VN')} đ
                          </td>

                          {/* Selling Price */}
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {item.sellingPrice.toLocaleString('vi-VN')} đ
                          </td>

                          {/* Stock Quantity */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`text-base font-black ${
                                  isOut
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : isLow
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {item.quantity}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                ĐM: {item.minStock}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Hết hàng
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Sắp hết hàng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Còn hàng
                              </span>
                            )}
                          </td>

                          {/* Warehouse */}
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <i className="fa-solid fa-location-dot text-slate-400 mr-1.5"></i>
                            {item.warehouse}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVariantProduct(item);
                                }}
                                title="Xem danh sách biến thể chi tiết"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-500/10 text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/20 dark:hover:text-[#EBC563] transition-colors cursor-pointer"
                              >
                                <i className="fa-solid fa-layer-group text-xs"></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAdjustForSingleItem(item);
                                }}
                                title="Điều chỉnh tồn kho"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500/10 text-slate-600 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/20 dark:hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                <i className="fa-solid fa-pen-to-square text-xs"></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImportSku(item.sku);
                                  setIsImportModalOpen(true);
                                }}
                                title="Nhập bổ sung SKU này"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                              >
                                <i className="fa-solid fa-plus text-xs"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
              <span>
                Hiển thị <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> / {items.length} mặt hàng SKU
              </span>
              <span suppressHydrationWarning>Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</span>
            </div>
          </div>
        )}

        {/* Tab 2: Stock Receipts History */}
        {activeTab === 'receipts' && (
          <div className="mt-6 space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#121212] border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base flex-shrink-0 ${receipt.colorClass}`}>
                    <i className={receipt.iconClass}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{receipt.id}</p>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {receipt.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{receipt.productName}</span> • {receipt.variantInfo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{receipt.quantity} đơn vị</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{receipt.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 whitespace-nowrap">
                    {receipt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: NHẬP KHO MỚI ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <i className="fa-solid fa-boxes-packing text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lập Phiếu Nhập Kho Mới</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ghi nhận thông tin nhập sản phẩm vào kho hàng</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-2 rounded-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleImportSubmit} className="p-6 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Sản phẩm / Mã SKU <span className="text-rose-500">*</span>
                </label>
                <select
                  value={importSku}
                  onChange={(e) => setImportSku(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                >
                  <option value="" className="bg-white dark:bg-[#171717]">
                    -- Chọn mặt hàng từ kho --
                  </option>
                  {items.map((i) => (
                    <option key={i.id} value={i.sku} className="bg-white dark:bg-[#171717]">
                      [{i.sku}] {i.name} - {i.color} ({i.size}) - Tồn hiện tại: {i.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Số lượng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={importQty}
                    onChange={(e) => setImportQty(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Đơn giá nhập (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={importUnitCost}
                    onChange={(e) => setImportUnitCost(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Nhà cung cấp / Đối tác
                </label>
                <input
                  type="text"
                  value={importSupplier}
                  onChange={(e) => setImportSupplier(e.target.value)}
                  placeholder="VD: Loro Piana Italia, Scabal Ltd..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Ghi chú chứng từ
                </label>
                <textarea
                  rows={2}
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  placeholder="Nhập số hóa đơn VAT, điều khoản giao hàng..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐIỀU CHỈNH TỒN KHO ================= */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <i className="fa-solid fa-sliders text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Điều Chỉnh Tồn Kho</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cập nhật số lượng kiểm kê thực tế hoặc điều chỉnh hàng lỗi</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-2 rounded-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs md:text-sm">
              {adjustVariantSku && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                  <span>🎯 Đang sửa riêng cho Biến thể: <strong className="font-mono">{adjustVariantSku}</strong></span>
                  <button type="button" onClick={() => setAdjustVariantSku('')} className="underline text-[10px] hover:text-amber-500">
                    Sửa toàn bộ SP
                  </button>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Chọn sản phẩm điều chỉnh <span className="text-rose-500">*</span>
                </label>
                <select
                  value={adjustItemId}
                  onChange={(e) => setAdjustItemId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                >
                  <option value="" className="bg-white dark:bg-[#171717]">
                    -- Chọn sản phẩm --
                  </option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id} className="bg-white dark:bg-[#171717]">
                      {i.name} [{i.sku}] - Hiện tồn: {i.quantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Phương thức điều chỉnh
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      adjustType === 'ADD'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-[#121212] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    + Cộng thêm
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('SUBTRACT')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      adjustType === 'SUBTRACT'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40'
                        : 'bg-slate-50 dark:bg-[#121212] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    - Trừ bớt
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('SET')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      adjustType === 'SET'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40'
                        : 'bg-slate-50 dark:bg-[#121212] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    = Thiết lập số chuẩn
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {adjustType === 'SET' ? 'Số lượng tồn kho thực tế chuẩn' : 'Số lượng thay đổi'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Lý do điều chỉnh
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                >
                  <option value="Kiểm kê định kỳ" className="bg-white dark:bg-[#171717]">
                    Kiểm kê định kỳ tháng/quý
                  </option>
                  <option value="Hàng lỗi hỏng / Đổi trả" className="bg-white dark:bg-[#171717]">
                    Hàng bị lỗi vải, rách hoặc đổi trả
                  </option>
                  <option value="Xuất làm mẫu trưng bày" className="bg-white dark:bg-[#171717]">
                    Xuất làm mẫu trưng bày showroom
                  </option>
                  <option value="Sai lệch sổ sách" className="bg-white dark:bg-[#171717]">
                    Đột biến sai lệch sổ sách ban đầu
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Ghi chú chi tiết
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Ghi rõ người duyệt hoặc biên bản kiểm kê..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POPUP CHI TIẾT BIẾN THỂ SẢN PHẨM ================= */}
      {selectedVariantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-4">
                <img
                  src={selectedVariantProduct.image}
                  alt={selectedVariantProduct.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                      {selectedVariantProduct.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-bold">
                      Mã SKU: #{selectedVariantProduct.sku}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {selectedVariantProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Kho lưu trữ: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedVariantProduct.warehouse}</span> • Tổng tồn kho: <span className="font-extrabold text-amber-600 dark:text-amber-400">{selectedVariantProduct.quantity} đơn vị</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVariantProduct(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            {/* Body: Variants breakdown table */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-amber-500"></i>
                  <span>Bảng Phân Tích Biến Thể Sản Phẩm Chi Tiết</span>
                </h4>
                <span className="text-xs text-indigo-600 dark:text-[#EBC563] font-bold">
                  Giá bán niêm yết: {selectedVariantProduct.sellingPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#121212] border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 whitespace-nowrap">Mã SKU Biến thể</th>
                      <th className="py-3 px-4 whitespace-nowrap">Màu sắc</th>
                      <th className="py-3 px-4 whitespace-nowrap">Kích thước</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Tồn thực tế</th>
                      <th className="py-3 px-4 whitespace-nowrap">Trạng thái kho</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Điều chỉnh nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(
                      Array.isArray(selectedVariantProduct.rawVariants) && selectedVariantProduct.rawVariants.length > 0
                        ? selectedVariantProduct.rawVariants.map((v: any, idx: number) => ({
                            sku: v.sku || `${selectedVariantProduct.sku}-${v.size || 'M'}-${idx + 1}`,
                            color: v.color || selectedVariantProduct.color || 'Navy Blue',
                            colorHex: v.color_hex || '#1b2a47',
                            size: v.size || 'M (48)',
                            stock: v.quantity ?? v.stock ?? 10,
                            min: selectedVariantProduct.minStock,
                          }))
                        : [
                            { sku: `${selectedVariantProduct.sku}-S`, color: selectedVariantProduct.color, colorHex: '#1b2a47', size: 'S (46)', stock: Math.max(0, Math.floor(selectedVariantProduct.quantity * 0.2)), min: selectedVariantProduct.minStock },
                            { sku: `${selectedVariantProduct.sku}-M`, color: selectedVariantProduct.color, colorHex: '#1b2a47', size: 'M (48)', stock: Math.max(0, Math.floor(selectedVariantProduct.quantity * 0.5)), min: selectedVariantProduct.minStock },
                            { sku: `${selectedVariantProduct.sku}-L`, color: selectedVariantProduct.color, colorHex: '#1b2a47', size: 'L (50)', stock: Math.max(0, Math.floor(selectedVariantProduct.quantity * 0.3)), min: selectedVariantProduct.minStock },
                          ]
                    ).map((v, idx) => {
                      const isOut = v.stock === 0;
                      const isLow = v.stock > 0 && v.stock <= v.min;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs whitespace-nowrap inline-block">
                              {v.sku}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm shrink-0" style={{ backgroundColor: v.colorHex }}></span>
                              <span className="whitespace-nowrap">{v.color}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                            {v.size}
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {v.stock} đơn vị
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 inline-block whitespace-nowrap">
                                Hết hàng
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 inline-block whitespace-nowrap">
                                Sắp hết ({v.stock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-block whitespace-nowrap">
                                Đang bán
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                openAdjustForVariant(selectedVariantProduct, v.sku, v.stock);
                              }}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                              Sửa tồn kho
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                💡 Nhấp vào nút <strong className="text-slate-700 dark:text-slate-200">Sửa tồn kho</strong> để nhập/xuất số lượng biến thể.
              </span>
              <button
                onClick={() => setSelectedVariantProduct(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}