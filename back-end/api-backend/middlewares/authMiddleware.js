const { pb, tokenBlacklist } = require("../services/pocketbase");

async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    if (tokenBlacklist.has(token))
      return res
        .status(401)
        .json({ success: false, error: "Token has been revoked" });

    pb.authStore.save(token);
    if (!pb.authStore.isValid)
      return res.status(401).json({ success: false, error: "Invalid token" });

    await pb.collection("users").authRefresh();
    if (!pb.authStore.model)
      return res
        .status(401)
        .json({ success: false, error: "Invalid user model" });

    req.user = pb.authStore.model;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
}

module.exports = { checkAuth };
