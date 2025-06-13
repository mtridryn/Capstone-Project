const express = require("express");
const { getHistory } = require("../controllers/historyController");
const { checkAuth } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/api/history", checkAuth, getHistory);

module.exports = router;
