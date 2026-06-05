const express = require("express");
const router = express.Router();
const { seedData } = require("../controllers/seeder.controller");

// Gọi GET /api/seed để tạo dữ liệu
router.get("/", seedData);

module.exports = router;
