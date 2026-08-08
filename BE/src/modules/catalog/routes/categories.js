const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../../core/middlewares/auth");

router.get("/", getCategories);
router.post("/", authenticateToken, authorizeRole("admin"), createCategory);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateCategory);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteCategory,
);

module.exports = router;
