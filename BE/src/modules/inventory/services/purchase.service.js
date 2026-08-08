const PurchaseOrder = require("../models/PurchaseOrder.model");
const PurchaseOrderItem = require("../models/PurchaseOrderItem.model");
const ProductVariant = require("../../catalog/models/ProductVariant.model");

class PurchaseService {
  async createPO(data) {
    let { items = [], ...poData } = data;

    if (
      poData.import_type === "RI_LEVEL" &&
      poData.ri_details &&
      poData.ri_details.length > 0
    ) {
      items = []; // Override items if RI_LEVEL
      for (const ri of poData.ri_details) {
        const query = { product_id: ri.product_id };
        if (ri.ri_type === "SIZE_FULL_COLOR") query.size = ri.base_attribute;
        if (ri.ri_type === "COLOR_FULL_SIZE") query.color = ri.base_attribute;

        const variants = await ProductVariant.find(query);
        if (variants.length > 0) {
          const unit_cost = ri.price_per_ri;
          for (const v of variants) {
            items.push({
              product_variant_id: v._id,
              quantity: ri.ri_quantity,
              unit_cost: unit_cost,
            });
          }
        }
      }
    }

    let total = 0;
    if (items && items.length > 0) {
      total = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0,
      );
    }
    poData.total_amount = total;
    poData.status = "PENDING";

    const po = await PurchaseOrder.create(poData);

    if (items && items.length > 0) {
      const poiPromises = items.map((item) =>
        PurchaseOrderItem.create({
          ...item,
          purchase_order_id: po._id,
          status: "PENDING",
        }),
      );
      await Promise.all(poiPromises);
    }

    return this.getPOById(po._id);
  }

  async getPOById(id) {
    const po = await PurchaseOrder.findById(id).populate("supplier_id");
    if (!po) return null;
    const items = await PurchaseOrderItem.find({
      purchase_order_id: id,
    }).populate({
      path: "product_variant_id",
      populate: {
        path: "product_id",
        select: "name main_img",
      },
    });
    return {
      ...po.toObject(),
      items,
    };
  }

  async getAllPOs() {
    return PurchaseOrder.find().populate("supplier_id").sort("-_id");
  }

  async approvePO(id) {
    const po = await PurchaseOrder.findById(id);
    if (!po) throw new Error("Purchase Order not found");
    if (po.status === "COMPLETED")
      throw new Error("Purchase Order already completed");

    const items = await PurchaseOrderItem.find({ purchase_order_id: id });

    // Sử dụng session cho transaction nếu MongoDB đang chạy dạng Replica Set.
    // Tuy nhiên, ở môi trường local Standalone, có thể Mongoose không hỗ trợ transaction.
    // Để an toàn và đơn giản cho Lab, mình thực thi tuần tự.
    // Ở thực tế production sẽ wrap trong: const session = await mongoose.startSession(); ...

    for (const item of items) {
      const variant = await ProductVariant.findById(item.product_variant_id);
      if (variant) {
        // 1. Tăng tồn kho
        variant.quantity += item.quantity;

        // 2. Cập nhật FIFO Lot
        const newLot = {
          poi_id: item._id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          remaining: item.quantity,
          created_at: new Date(),
        };

        variant.lots_history.push(newLot);

        // Nếu là lô hàng đầu tiên (hoặc lô cũ đã bán hết), set current_lot
        if (!variant.current_lot) {
          variant.current_lot = item._id.toString();
          variant.current_lot_sold = 0;
        }

        // Cập nhật cost_price trung bình hoặc cost_price hiện hành (tuỳ ý)
        // Ở đây ta có thể gán cost_price bằng giá của lô mới nhất.
        variant.cost_price = item.unit_cost;

        // Để array thay đổi được mongoose nhận diện
        variant.markModified("lots_history");
        await variant.save();
      }

      // 3. Update PO Item status
      item.status = "RECEIVED";
      await item.save();
    }

    // 4. Update PO status
    po.status = "COMPLETED";
    await po.save();

    return this.getPOById(id);
  }
}

module.exports = new PurchaseService();
