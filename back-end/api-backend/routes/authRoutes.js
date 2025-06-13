const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { checkAuth } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/api/register", register);
router.post("/api/login", login);
router.post("/api/logout", checkAuth, logout);

module.exports = router;
