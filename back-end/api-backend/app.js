const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const predictRoutes = require("./routes/predictRoutes");
const productRoutes = require("./routes/productRoutes");
const historyRoutes = require("./routes/historyRoutes");
const poinRoutes = require("./routes/poinRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(predictRoutes);
app.use(productRoutes);
app.use(historyRoutes);
app.use(poinRoutes);

module.exports = app;
