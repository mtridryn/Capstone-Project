const { pb, tokenBlacklist } = require("../services/pocketbase");

const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const user = await pb.collection("users").create({
      nama,
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      poin: 0,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    res.json({
      success: true,
      token: pb.authStore.token,
      user: authData.record,
    });
  } catch {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
};

const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    tokenBlacklist.add(token);
    pb.authStore.clear();
  }
  res.json({ success: true, message: "Logout successful" });
};

module.exports = { register, login, logout };
