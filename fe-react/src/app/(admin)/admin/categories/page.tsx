"use client";

import { useState, useEffect } from "react";
import AdminTable from "../../../../components/admin/AdminTable";
import { apiClient } from "../../../../services/apiClient";

interface CategoryItem {
  id: string;
  _id?: string | number;
  name: string;
  slug: string;
  productCount: number;
  description: string;
  status: "ACTIVE" | "HIDDEN";
  image: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "CAT-01",
    _id: 1,
    name: "Vest & Blazer",
    slug: "vest-blazer",
    productCount: 18,
    description: "Dòng bộ Suit và Áo Blazer cắt may chuẩn phong cách Quiet Luxury thượng lưu.",
    status: "ACTIVE",
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: "CAT-02",
    _id: 2,
    name: "Quần Âu Slim Fit",
    slug: "quan-au-slimfit",
    productCount: 24,
    description: "Quần âu Chinos và quần tây chất liệu wool tự nhiên thoáng khí chống nhăn.",
    status: "ACTIVE",
    image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: "CAT-03",
    _id: 3,
    name: "Áo Sơ Mi Oxford",
    slug: "ao-so-mi-oxford",
    productCount: 32,
    description: "Sơ mi Cotton Ai Cập dệt nổi đường may sắc nét tôn vinh vóc dáng.",
    status: "ACTIVE",
    image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: "CAT-04",
    _id: 4,
    name: "Giày Da & Phụ Kiện",
    slug: "giay-da-phu-kien",
    productCount: 15,
    description: "Giày da Ý thủ công, thắt lưng da bò nguyên tấm và khăn lụa gài túi.",
    status: "ACTIVE",
    image: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
];

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "HIDDEN">("ACTIVE");

  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res: any = await apiClient.get("/categories");
        if (Array.isArray(res) && res.length > 0) {
          const mapped: CategoryItem[] = res.map((cat: any, idx: number) => ({
            id: `CAT-0${cat._id || cat.id || idx + 1}`,
            _id: cat._id || cat.id,
            name: cat.name || "Danh mục",
            slug: cat.slug || "danh-muc",
            productCount: cat.product_count || 12,
            description: cat.description || "Mô tả danh mục sản phẩm",
            status: cat.status === "HIDDEN" ? "HIDDEN" : "ACTIVE",
            image: cat.image || "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.warn("Categories API unavailable, using initial state:", err);
      }
    }
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDesc("");
    setStatus("ACTIVE");
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDesc(cat.description);
    setStatus(cat.status);
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: desc,
      status,
    };

    if (editingCategory) {
      try {
        await apiClient.put(`/categories/${editingCategory._id || editingCategory.id}`, payload);
      } catch (err) {
        console.warn("Update category API error:", err);
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name, slug: payload.slug, description: desc, status }
            : c
        )
      );
    } else {
      let createdId = `CAT-0${categories.length + 1}`;
      try {
        const res: any = await apiClient.post("/categories", payload);
        if (res?._id || res?.id) createdId = `CAT-0${res._id || res.id}`;
      } catch (err) {
        console.warn("Create category API error:", err);
      }

      const newCat: CategoryItem = {
        id: createdId,
        name,
        slug: payload.slug,
        productCount: 0,
        description: desc || "Danh mục sản phẩm mới",
        status,
        image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
      };
      setCategories((prev) => [...prev, newCat]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const target = categories.find((c) => c.id === id);
      if (target?._id) {
        try {
          await apiClient.delete(`/categories/${target._id}`);
        } catch (err) {
          console.warn("Delete category API error:", err);
        }
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản lý Danh mục Sản phẩm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Phân loại hàng hóa giúp khách hàng tìm kiếm trang phục nhanh chóng trên website.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-sm" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white dark:bg-[#171717] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm tên danh mục, đường dẫn slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        </div>

        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
          Tổng số: {filteredCategories.length} danh mục
        </span>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <AdminTable>
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                <th className="px-5 py-4 whitespace-nowrap">Hình đại diện</th>
                <th className="px-5 py-4 whitespace-nowrap">Tên Danh Mục</th>
                <th className="px-5 py-4 whitespace-nowrap">Slug URL</th>
                <th className="px-5 py-4 whitespace-nowrap">Số Sản Phẩm</th>
                <th className="px-5 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-5 py-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-indigo-600 dark:text-[#EBC563] whitespace-nowrap">
                    /{cat.slug}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-amber-950/60 text-indigo-700 dark:text-amber-300 text-xs font-black rounded-full border border-indigo-200 dark:border-amber-800/40">
                      {cat.productCount} sản phẩm
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {cat.status === "ACTIVE" ? (
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black rounded-lg uppercase">
                        Hiển thị
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black rounded-lg uppercase">
                        Đã ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 flex items-center justify-center text-xs transition-all"
                        title="Chỉnh sửa"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center text-xs transition-all"
                        title="Xóa"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>
      </div>

      {/* Modal Add / Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder="Ví dụ: Áo Blazer Nam"
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-bold text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Đường dẫn (Slug URL)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ao-blazer-nam"
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-indigo-600 dark:text-[#EBC563] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Mô tả ngắn
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Mô tả phong cách và chủng loại mặt hàng thuộc danh mục..."
                  className="w-full h-24 px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-medium text-slate-900 dark:text-white transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                  Trạng thái
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("ACTIVE")}
                    className={`py-3 rounded-xl text-xs font-extrabold transition-all ${
                      status === "ACTIVE"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Hiển thị
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("HIDDEN")}
                    className={`py-3 rounded-xl text-xs font-extrabold transition-all ${
                      status === "HIDDEN"
                        ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Đã ẩn
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-extrabold hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-indigo-700 dark:hover:bg-[#EBC563]"
              >
                Lưu Danh Mục
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}