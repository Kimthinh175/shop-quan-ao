const express = require('express');
const router = express.Router();
const {
    getAllPOs,
    getPOById,
    createPO,
    approvePO
} = require('../controllers/purchase.controller');

/**
 * @swagger
 * tags:
 *   name: PurchaseOrders
 *   description: Quản lý Phiếu nhập kho
 */

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Lấy danh sách phiếu nhập kho
 *     tags: [PurchaseOrders]
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Tạo phiếu nhập kho mới
 *     tags: [PurchaseOrders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: number
 *               import_type:
 *                 type: string
 *                 enum: [VARIANT_LEVEL, RI_LEVEL]
 *                 default: VARIANT_LEVEL
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_variant_id:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     unit_cost:
 *                       type: number
 *               ri_details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: number
 *                     ri_type:
 *                       type: string
 *                       enum: [SIZE_FULL_COLOR, COLOR_FULL_SIZE]
 *                     base_attribute:
 *                       type: string
 *                     ri_quantity:
 *                       type: number
 *                     price_per_ri:
 *                       type: number
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.route('/')
    .get(getAllPOs)
    .post(createPO);

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu nhập kho
 *     tags: [PurchaseOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phiếu nhập
 */
router.route('/:id')
    .get(getPOById);

/**
 * @swagger
 * /api/purchases/{id}/approve:
 *   post:
 *     summary: Duyệt (Xác nhận) phiếu nhập kho
 *     description: Tự động cộng số lượng vào Variant và tạo FIFO Lot history
 *     tags: [PurchaseOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Duyệt thành công
 */
router.route('/:id/approve')
    .post(approvePO);

module.exports = router;
