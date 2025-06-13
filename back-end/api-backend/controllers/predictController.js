const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { pb } = require("../services/pocketbase");

const predict = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    const filePath = req.file.path;

    const formFlask = new FormData();
    formFlask.append("file", fs.createReadStream(filePath));

    const flaskRes = await axios.post(
      "http://localhost:5001/predict",
      formFlask,
      {
        headers: formFlask.getHeaders(),
      }
    );

    const { confidence, label } = flaskRes.data;

    const formPB = new FormData();
    formPB.append("userid", req.user.id);
    formPB.append("hasil", label);
    formPB.append("akurasi", confidence);
    formPB.append("wajah", fs.createReadStream(filePath));

    const pbRes = await axios.post(
      "http://127.0.0.1:8090/api/collections/hasil_analisis/records",
      formPB,
      {
        headers: {
          ...formPB.getHeaders(),
          Authorization: `Bearer ${pb.authStore.token}`,
        },
      }
    );

    fs.unlinkSync(filePath);
    res.json({ success: true, data: pbRes.data });
  } catch (err) {
    console.error("Predict error:", err.response?.data || err.message || err);
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message || err,
    });
  }
};

module.exports = { predict };
