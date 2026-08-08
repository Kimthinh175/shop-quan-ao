const mongoose = require('mongoose');
const User = require('../../users/models/User.model');
const Customer = require('../../users/models/Customer.model');
const Product = require('../../catalog/models/Product.model');
const ProductVariant = require('../../catalog/models/ProductVariant.model');
const Category = require('../../catalog/models/Category.model');
const Brand = require('../../catalog/models/Brand.model');
const Season = require('../../catalog/models/Season.model');
const Gender = require('../../catalog/models/Gender.model');
const Material = require('../../catalog/models/Material.model');
const Form = require('../../catalog/models/Form.model');
const Sport = require('../../catalog/models/Sport.model');
const Supplier = require('../../inventory/models/Supplier.model');
const Inventory = require('../../inventory/models/Inventory.model');
const Voucher = require('../../promotions/models/Voucher.model');
const Order = require('../../checkout/models/Order.model');
const Payment = require('../../checkout/models/Payment.model');
const Article = require('../../content/models/Article.model');
const PurchaseOrder = require('../../inventory/models/PurchaseOrder.model');
const Counter = require('../../../core/models/Counter.model');

const seedData = async () => {
  try {
    console.log('--- Bắt đầu Seeding dữ liệu toàn hệ thống ---');

    // 1. Xóa toàn bộ dữ liệu cũ (Drop DB để sạch sẽ nhất)
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    console.log('✅ Đã dọn dẹp Database');

    // 2. Seed Users (Nhân viên)
    const users = [
      { _id: 1, username: 'admin', password: '123', role: 'admin' },
      { _id: 2, username: 'staff1', password: '123', role: 'cashier' },
      { _id: 3, username: 'staff2', password: '123', role: 'warehouse' }
    ];
    for (const u of users) await User.create(u);
    console.log('✅ Đã tạo Nhân viên');

    // 3. Seed Catalog Lookups
    const categories = [
      { _id: 1, name: 'Áo Thun' }, { _id: 2, name: 'Áo Khoác' }, { _id: 3, name: 'Quần Short' }, { _id: 4, name: 'Quần Dài' }, { _id: 5, name: 'Đồ Lót' }
    ];
    for (const c of categories) await Category.create(c);

    const brands = [
      { _id: 1, name: 'Coolmate', code: 'COOLMATE' }, { _id: 2, name: '84RISING', code: '84RISING' }, { _id: 3, name: 'CM24', code: 'CM24' }
    ];
    for (const b of brands) await Brand.create(b);

    const seasons = [
      { _id: 1, name: 'Xuân Hè', code: 'SPRING_SUMMER' }, { _id: 2, name: 'Thu Đông', code: 'AUTUMN_WINTER' }, { _id: 3, name: 'All-Season', code: 'ALL_SEASON' }
    ];
    for (const s of seasons) await Season.create(s);

    const genders = [
      { _id: 1, name: 'Nam', code: 'MALE' }, { _id: 2, name: 'Nữ', code: 'FEMALE' }, { _id: 3, name: 'Unisex', code: 'UNISEX' }
    ];
    for (const g of genders) await Gender.create(g);

    const materials = [
      { _id: 1, name: 'Cotton Compact', code: 'COTTON_COMPACT' }, { _id: 2, name: 'Polyester', code: 'POLYESTER' }, { _id: 3, name: 'Linen', code: 'LINEN' }, { _id: 4, name: 'Excool', code: 'EXCOOL' }
    ];
    for (const m of materials) await Material.create(m);

    const forms = [
      { _id: 1, name: 'Regular Fit', code: 'REGULAR' }, { _id: 2, name: 'Slim Fit', code: 'SLIM' }, { _id: 3, name: 'Oversize', code: 'OVERSIZE' }
    ];
    for (const f of forms) await Form.create(f);

    const sports = [
      { _id: 1, name: 'Chạy Bộ', code: 'RUNNING' }, { _id: 2, name: 'Gym / Training', code: 'GYM' }, { _id: 3, name: 'Bóng Đá', code: 'FOOTBALL' }, { _id: 4, name: 'Casual (Không)', code: 'CASUAL' }
    ];
    for (const sp of sports) await Sport.create(sp);
    console.log('✅ Đã tạo Danh mục, Thương hiệu, Giới tính, Mùa vụ, Form, Chất liệu, Thể thao');

    // 4. Seed Suppliers
    const suppliers = [
      { _id: 1, name: 'Xưởng may cao cấp Hà Nội', phone: '0912345678', address: '123 Cầu Giấy, HN' },
      { _id: 2, name: 'Vải lụa Bảo Lộc', phone: '0987654321', address: 'Bảo Lộc, Lâm Đồng' },
      { _id: 3, name: 'Nhà máy dệt thoi Sài Gòn', phone: '0933445566', address: 'Quận 12, TP HCM' }
    ];
    for (const s of suppliers) await Supplier.create(s);

    // 5. Seed Vouchers
    const vouchers = [
      { _id: 1, code: 'HELLO2026', name: 'Chào Xuân 2026', discount_type: 'percentage', discount_value: 10, min_order_value: 1000000, status: 'active' },
      { _id: 2, code: 'VIP100', name: 'Giảm 100k cho khách VIP', discount_type: 'fixed_amount', discount_value: 100000, min_order_value: 500000, status: 'active' },
      { _id: 3, code: 'FREESHIP', name: 'Miễn phí vận chuyển', discount_type: 'fixed_amount', discount_value: 30000, min_order_value: 200000, status: 'active' }
    ];
    for (const v of vouchers) await Voucher.create(v);

    // 6. Seed Customers
    const customers = [
      { 
        _id: 1, full_name: 'Nguyễn Văn A', phone: '0900111222', email: 'a@example.com', points: 50,
        addresses: [{ _id: 1, recipient_name: 'Văn A', phone: '0900111222', street_address: '10 Hai Bà Trưng', province: 'Hà Nội', is_default: true }]
      },
      { 
        _id: 2, full_name: 'Trần Thị B', phone: '0900333444', email: 'b@example.com', points: 150,
        addresses: [{ _id: 2, recipient_name: 'Thị B', phone: '0900333444', street_address: '50 Lê Lợi', province: 'TP HCM', is_default: true }]
      },
      { 
        _id: 3, full_name: 'Lê Văn C', phone: '0900555666', email: 'c@example.com', points: 10,
        addresses: [{ _id: 3, recipient_name: 'Văn C', phone: '0900555666', street_address: '123 Nguyễn Văn Linh', province: 'Đà Nẵng', is_default: true }]
      }
    ];
    for (const c of customers) await Customer.create(c);

    // 7. Seed Products & Variants
    const productData = [
  {
    _id: 1,
    name: 'Áo Thun Basic 0',
    category_id: 1,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 1,
    material_id: 1,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 101,
        sku: 'SKU-1-1',
        size: 'S',
        color: 'Black',
        price: 147467,
        cost_price: 97467,
        sold: 149
      },
      {
        _id: 102,
        sku: 'SKU-1-2',
        size: 'M',
        color: 'White',
        price: 147467,
        cost_price: 97467,
        sold: 182
      }
    ]
  },
  {
    _id: 2,
    name: 'Quần Short Thể Thao 1',
    category_id: 2,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 2,
    material_id: 2,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 103,
        sku: 'SKU-2-1',
        size: 'M',
        color: 'White',
        price: 310328,
        cost_price: 260328,
        sold: 70
      },
      {
        _id: 104,
        sku: 'SKU-2-2',
        size: 'L',
        color: 'Navy',
        price: 310328,
        cost_price: 260328,
        sold: 38
      }
    ]
  },
  {
    _id: 3,
    name: 'Áo Polo Pique 2',
    category_id: 3,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 3,
    material_id: 3,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 105,
        sku: 'SKU-3-1',
        size: 'L',
        color: 'Navy',
        price: 271448,
        cost_price: 221448,
        sold: 190
      },
      {
        _id: 106,
        sku: 'SKU-3-2',
        size: 'XL',
        color: 'Grey',
        price: 271448,
        cost_price: 221448,
        sold: 199
      }
    ]
  },
  {
    _id: 4,
    name: 'Áo Khoác Gió 3',
    category_id: 4,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 4,
    material_id: 4,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 107,
        sku: 'SKU-4-1',
        size: 'XL',
        color: 'Grey',
        price: 416986,
        cost_price: 366986,
        sold: 149
      },
      {
        _id: 108,
        sku: 'SKU-4-2',
        size: 'S',
        color: 'Black',
        price: 416986,
        cost_price: 366986,
        sold: 153
      }
    ]
  },
  {
    _id: 5,
    name: 'Quần Dài Kaki 4',
    category_id: 5,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 1,
    material_id: 1,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 109,
        sku: 'SKU-5-1',
        size: 'S',
        color: 'Black',
        price: 165806,
        cost_price: 115806,
        sold: 102
      },
      {
        _id: 110,
        sku: 'SKU-5-2',
        size: 'M',
        color: 'White',
        price: 165806,
        cost_price: 115806,
        sold: 21
      }
    ]
  },
  {
    _id: 6,
    name: 'Đồ Lót Nam 5',
    category_id: 1,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 2,
    material_id: 2,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 111,
        sku: 'SKU-6-1',
        size: 'M',
        color: 'White',
        price: 369141,
        cost_price: 319141,
        sold: 9
      },
      {
        _id: 112,
        sku: 'SKU-6-2',
        size: 'L',
        color: 'Navy',
        price: 369141,
        cost_price: 319141,
        sold: 121
      }
    ]
  },
  {
    _id: 7,
    name: 'Áo Chạy Bộ 6',
    category_id: 2,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 3,
    material_id: 3,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 113,
        sku: 'SKU-7-1',
        size: 'L',
        color: 'Navy',
        price: 117503,
        cost_price: 67503,
        sold: 42
      },
      {
        _id: 114,
        sku: 'SKU-7-2',
        size: 'XL',
        color: 'Grey',
        price: 117503,
        cost_price: 67503,
        sold: 100
      }
    ]
  },
  {
    _id: 8,
    name: 'Quần Jogger 7',
    category_id: 3,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 4,
    material_id: 4,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 115,
        sku: 'SKU-8-1',
        size: 'XL',
        color: 'Grey',
        price: 260561,
        cost_price: 210561,
        sold: 135
      },
      {
        _id: 116,
        sku: 'SKU-8-2',
        size: 'S',
        color: 'Black',
        price: 260561,
        cost_price: 210561,
        sold: 151
      }
    ]
  },
  {
    _id: 9,
    name: 'Áo Thun Oversize 8',
    category_id: 4,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 1,
    material_id: 1,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 117,
        sku: 'SKU-9-1',
        size: 'S',
        color: 'Black',
        price: 271031,
        cost_price: 221031,
        sold: 193
      },
      {
        _id: 118,
        sku: 'SKU-9-2',
        size: 'M',
        color: 'White',
        price: 271031,
        cost_price: 221031,
        sold: 101
      }
    ]
  },
  {
    _id: 10,
    name: 'Quần Lót Kháng Khuẩn 9',
    category_id: 5,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 2,
    material_id: 2,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 119,
        sku: 'SKU-10-1',
        size: 'M',
        color: 'White',
        price: 305444,
        cost_price: 255444,
        sold: 71
      },
      {
        _id: 120,
        sku: 'SKU-10-2',
        size: 'L',
        color: 'Navy',
        price: 305444,
        cost_price: 255444,
        sold: 48
      }
    ]
  },
  {
    _id: 11,
    name: 'Áo Thun Basic 10',
    category_id: 1,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 3,
    material_id: 3,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 121,
        sku: 'SKU-11-1',
        size: 'L',
        color: 'Navy',
        price: 365223,
        cost_price: 315223,
        sold: 85
      },
      {
        _id: 122,
        sku: 'SKU-11-2',
        size: 'XL',
        color: 'Grey',
        price: 365223,
        cost_price: 315223,
        sold: 29
      }
    ]
  },
  {
    _id: 12,
    name: 'Quần Short Thể Thao 11',
    category_id: 2,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 4,
    material_id: 4,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 123,
        sku: 'SKU-12-1',
        size: 'XL',
        color: 'Grey',
        price: 317951,
        cost_price: 267951,
        sold: 170
      },
      {
        _id: 124,
        sku: 'SKU-12-2',
        size: 'S',
        color: 'Black',
        price: 317951,
        cost_price: 267951,
        sold: 63
      }
    ]
  },
  {
    _id: 13,
    name: 'Áo Polo Pique 12',
    category_id: 3,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 1,
    material_id: 1,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 125,
        sku: 'SKU-13-1',
        size: 'S',
        color: 'Black',
        price: 221190,
        cost_price: 171190,
        sold: 59
      },
      {
        _id: 126,
        sku: 'SKU-13-2',
        size: 'M',
        color: 'White',
        price: 221190,
        cost_price: 171190,
        sold: 22
      }
    ]
  },
  {
    _id: 14,
    name: 'Áo Khoác Gió 13',
    category_id: 4,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 2,
    material_id: 2,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 127,
        sku: 'SKU-14-1',
        size: 'M',
        color: 'White',
        price: 361824,
        cost_price: 311824,
        sold: 27
      },
      {
        _id: 128,
        sku: 'SKU-14-2',
        size: 'L',
        color: 'Navy',
        price: 361824,
        cost_price: 311824,
        sold: 104
      }
    ]
  },
  {
    _id: 15,
    name: 'Quần Dài Kaki 14',
    category_id: 5,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 3,
    material_id: 3,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 129,
        sku: 'SKU-15-1',
        size: 'L',
        color: 'Navy',
        price: 141802,
        cost_price: 91802,
        sold: 52
      },
      {
        _id: 130,
        sku: 'SKU-15-2',
        size: 'XL',
        color: 'Grey',
        price: 141802,
        cost_price: 91802,
        sold: 136
      }
    ]
  },
  {
    _id: 16,
    name: 'Đồ Lót Nam 15',
    category_id: 1,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 4,
    material_id: 4,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 131,
        sku: 'SKU-16-1',
        size: 'XL',
        color: 'Grey',
        price: 318957,
        cost_price: 268957,
        sold: 47
      },
      {
        _id: 132,
        sku: 'SKU-16-2',
        size: 'S',
        color: 'Black',
        price: 318957,
        cost_price: 268957,
        sold: 130
      }
    ]
  },
  {
    _id: 17,
    name: 'Áo Chạy Bộ 16',
    category_id: 2,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 1,
    material_id: 1,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 133,
        sku: 'SKU-17-1',
        size: 'S',
        color: 'Black',
        price: 306971,
        cost_price: 256971,
        sold: 1
      },
      {
        _id: 134,
        sku: 'SKU-17-2',
        size: 'M',
        color: 'White',
        price: 306971,
        cost_price: 256971,
        sold: 120
      }
    ]
  },
  {
    _id: 18,
    name: 'Quần Jogger 17',
    category_id: 3,
    brand_id: 3,
    season_id: 3,
    gender_id: 3,
    sport_id: 2,
    material_id: 2,
    form_id: 3,
    main_img: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 135,
        sku: 'SKU-18-1',
        size: 'M',
        color: 'White',
        price: 362662,
        cost_price: 312662,
        sold: 178
      },
      {
        _id: 136,
        sku: 'SKU-18-2',
        size: 'L',
        color: 'Navy',
        price: 362662,
        cost_price: 312662,
        sold: 11
      }
    ]
  },
  {
    _id: 19,
    name: 'Áo Thun Oversize 18',
    category_id: 4,
    brand_id: 1,
    season_id: 1,
    gender_id: 1,
    sport_id: 3,
    material_id: 3,
    form_id: 1,
    main_img: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 137,
        sku: 'SKU-19-1',
        size: 'L',
        color: 'Navy',
        price: 305170,
        cost_price: 255170,
        sold: 70
      },
      {
        _id: 138,
        sku: 'SKU-19-2',
        size: 'XL',
        color: 'Grey',
        price: 305170,
        cost_price: 255170,
        sold: 11
      }
    ]
  },
  {
    _id: 20,
    name: 'Quần Lót Kháng Khuẩn 19',
    category_id: 5,
    brand_id: 2,
    season_id: 2,
    gender_id: 2,
    sport_id: 4,
    material_id: 4,
    form_id: 2,
    main_img: 'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&w=600',
    images: [
      'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600'
    ],
    variants: [
      {
        _id: 139,
        sku: 'SKU-20-1',
        size: 'XL',
        color: 'Grey',
        price: 464717,
        cost_price: 414717,
        sold: 7
      },
      {
        _id: 140,
        sku: 'SKU-20-2',
        size: 'S',
        color: 'Black',
        price: 464717,
        cost_price: 414717,
        sold: 184
      }
    ]
  }
];

    for (const p of productData) {
      await Product.create(p);
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          v.product_id = p._id;
          await ProductVariant.create(v);
        }
      }
    }
    console.log('✅ Đã tạo Sản phẩm & Biến thể');

    // 8. Seed Inventory
    for (const p of productData) {
      for (const v of p.variants) {
        await Inventory.create({ product_id: p._id, variant_id: v._id, quantity: 100 });
      }
    }

    // 9. Seed Orders & Payments
    const orders = [
      {
        _id: 1, customer_id: 1, user_id: 2, subtotal: 350000, total_price: 350000, total_amount: 350000, order_status: 'completed',
        items: [{ sku: 'PO-PIQ-M-WT', product_name: 'Áo Polo Pique Khử Mùi', size: 'M', color: 'White', quantity: 1, unit_price: 350000 }]
      },
      {
        _id: 2, customer_id: 2, user_id: 2, subtotal: 159000, total_price: 159000, total_amount: 159000, order_status: 'pending',
        items: [{ sku: 'TS-COT-S-BK', product_name: 'Áo Thun Cotton Basic Nam', size: 'S', color: 'Black', quantity: 1, unit_price: 159000 }]
      },
      {
        _id: 3, customer_id: 3, user_id: 2, subtotal: 249000, total_price: 249000, total_amount: 219000, discount_amount: 30000, order_status: 'shipping',
        items: [{ sku: 'SH-EX-L-NV', product_name: 'Quần Short Thể Thao Siêu Nhẹ', size: 'L', color: 'Navy', quantity: 1, unit_price: 249000 }]
      }
    ];
    for (const o of orders) await Order.create(o);

    const payments = [
      { _id: 1, order_id: 1, payment_method: 'COD', amount: 350000, status: 'success', paid_at: new Date() },
      { _id: 2, order_id: 2, payment_method: 'BANK_TRANSFER', amount: 159000, status: 'pending' },
      { _id: 3, order_id: 3, payment_method: 'CASH', amount: 219000, status: 'success', paid_at: new Date() }
    ];
    for (const py of payments) await Payment.create(py);
    console.log('✅ Đã tạo Đơn hàng & Thanh toán');

    // 10. Seed Articles
    const articles = [
      { _id: 1, title: "Coolmate Functional E-commerce", slug: 'coolmate', thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', content: '...', author_id: 1, status: 'published' },
      { _id: 2, title: "Xu hướng Áo Thun Oversize 2026", slug: 'xu-huong-ao-thun', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200', content: '...', author_id: 1, status: 'published' },
      { _id: 3, title: "Bí quyết chọn vải mùa hè", slug: 'chon-vai-mua-he', thumbnail: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1200', content: '...', author_id: 1, status: 'published' }
    ];
    for (const a of articles) await Article.create(a);
    console.log('✅ Đã tạo Bài viết');

    // 11. Khởi tạo Counters
    const counterNames = ['product_id', 'category_id', 'order_id', 'customer_id', 'user_id', 'inventory_id', 'article_id', 'supplier_id', 'voucher_id', 'payment_id', 'brand_id', 'season_id', 'gender_id', 'material_id', 'form_id', 'sport_id'];
    for (const name of counterNames) {
      await Counter.create({ id: name, seq: 100 }); 
    }

    console.log('🚀 Seeding hoàn tất thành công!');
    return { message: 'Seeding hoàn tất!' };
  } catch (error) {
    console.error('❌ Lỗi Seeding:', error);
    throw error;
  }
};

module.exports = { seedData };
