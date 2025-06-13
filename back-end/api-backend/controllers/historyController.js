const { pb } = require("../services/pocketbase");

const getHistory = async (req, res) => {
  try {
    const history = await pb.collection("hasil_analisis").getFullList({
      filter: `userid = "${req.user.id}"`,
      sort: "-created",
      perPage: 100,
    });

    res.json({ success: true, history });
  } catch {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getHistory };
