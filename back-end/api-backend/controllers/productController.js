const { pb } = require("../services/pocketbase");

const getProducts = async (req, res) => {
  try {
    const {
      skintype,
      product_type,
      brand,
      notable_effects,
      min_price,
      max_price,
    } = req.query;

    const filters = [];

    if (skintype) {
      const skintypeFilter = skintype
        .split(",")
        .map((t) => `skintype ~ "${t.trim()}"`)
        .join(" || ");
      filters.push(`(${skintypeFilter})`);
    }

    if (product_type) {
      const productTypeFilter = product_type
        .split(",")
        .map((t) => `product_type ~ "${t.trim()}"`)
        .join(" || ");
      filters.push(`(${productTypeFilter})`);
    }

    if (notable_effects) {
      const effectsFilter = notable_effects
        .split(",")
        .map((t) => `notable_effects ~ "${t.trim()}"`)
        .join(" || ");
      filters.push(`(${effectsFilter})`);
    }

    // Untuk range harga, asumsikan field harga namanya 'price' dan bertipe number
    if (min_price && max_price) {
      filters.push(`price >= ${min_price} && price <= ${max_price}`);
    } else if (min_price) {
      filters.push(`price >= ${min_price}`);
    } else if (max_price) {
      filters.push(`price <= ${max_price}`);
    }

    // Gabung semua filter dengan AND
    const filter = filters.join(" && ") || undefined;

    const products = await pb.collection("product").getFullList({
      perPage: 500,
      filter,
    });

    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getProducts };
