const express = require("express");
const multer = require("multer");
const { predict } = require("../controllers/predictController");
const { checkAuth } = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });
const router = express.Router();
router.post("/api/predict", checkAuth, upload.single("file"), predict);

module.exports = router;
