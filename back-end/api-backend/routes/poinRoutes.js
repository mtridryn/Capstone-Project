const express = require("express");
const { addPoin } = require("../controllers/poinController");
const { checkAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/api/add-poin", checkAuth, addPoin);

module.exports = router;
