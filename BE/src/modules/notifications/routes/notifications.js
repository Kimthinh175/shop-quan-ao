const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const { authorizeRole } = require("../../../core/middlewares/auth");

// Lấy danh sách thông báo của user hiện tại (Customer hoặc Admin)
router.get("/", notificationsController.getMyNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);

// Đánh dấu đọc
router.put("/read-all", notificationsController.markAllAsRead);
router.put("/:id/read", notificationsController.markAsRead);

// Admin Broadcast
router.post(
  "/broadcast",
  authorizeRole("superadmin", "admin", "manager"),
  notificationsController.broadcast,
);

module.exports = router;
