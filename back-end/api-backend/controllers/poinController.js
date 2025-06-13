const { pb } = require("../services/pocketbase");

const addPoin = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await pb.collection("users").getOne(userId);

    const updated = await pb.collection("users").update(userId, {
      poin: (user.poin || 0) + 1,
    });

    res.json({
      success: true,
      message: "Poin berhasil ditambahkan",
      poin: updated.poin,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { addPoin };
