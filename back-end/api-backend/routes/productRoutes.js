const express = require("express");
const { getProducts } = require("../controllers/productController");
const { checkAuth } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/api/products", checkAuth, getProducts);

module.exports = router;
