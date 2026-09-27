const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DATABASE_NAME = process.env.MONGODB_DATABASE || "dacsantaynguyennn";
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "sanpham";
const client = new MongoClient(MONGODB_URI);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "trang-chu.html"));
});

let productsCollection;

async function getProductsCollection() {
  if (!productsCollection) {
    await client.connect();
    productsCollection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  }
  return productsCollection;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateProduct(product) {
  if (!product || typeof product.name !== "string" || !product.name.trim()) {
    return "name là bắt buộc";
  }
  if (typeof product.price !== "number" || product.price < 0) {
    return "price phải là số không âm";
  }
  return null;
}

function normalizeProduct(product) {
  const normalized = { ...product };
  if (typeof normalized.price === "string" && normalized.price.trim() !== "") {
    normalized.price = Number(normalized.price);
  }
  if (typeof normalized.stock === "string" && normalized.stock.trim() !== "") {
    normalized.stock = Number(normalized.stock);
  }
  return normalized;
}

app.get("/api/health", async (req, res) => {
  try {
    await getProductsCollection();
    await client.db(DATABASE_NAME).command({ ping: 1 });
    res.json({ status: "ok", database: DATABASE_NAME });
  } catch (error) {
    res.status(503).json({ status: "error", message: "MongoDB chưa kết nối" });
  }
});

app.get(["/api/products", "/api/product"], async (req, res, next) => {
  try {
    const collection = await getProductsCollection();
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === "true";
    }
    const products = await collection.find(filter).sort({ id: 1 }).toArray();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get(["/api/products/:id", "/api/product/:id"], async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "id không hợp lệ" });

    const product = await (await getProductsCollection()).findOne({ id });
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.post(["/api/products", "/api/product"], async (req, res, next) => {
  try {
    const requestProduct = normalizeProduct(req.body);
    const validationError = validateProduct(requestProduct);
    if (validationError)
      return res.status(400).json({ message: validationError });

    const collection = await getProductsCollection();
    const latest = await collection.find().sort({ id: -1 }).limit(1).next();
    const product = { ...requestProduct, id: (latest?.id || 0) + 1 };
    delete product._id;
    await collection.insertOne(product);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

app.put(["/api/products/:id", "/api/product/:id"], async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "id không hợp lệ" });

    const requestProduct = normalizeProduct(req.body);
    const validationError = validateProduct(requestProduct);
    if (validationError)
      return res.status(400).json({ message: validationError });

    const product = { ...requestProduct, id };
    delete product._id;
    const result = await (
      await getProductsCollection()
    ).replaceOne({ id }, product);
    if (!result.matchedCount)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete(
  ["/api/products/:id", "/api/product/:id"],
  async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "id không hợp lệ" });

      const result = await (await getProductsCollection()).deleteOne({ id });
      if (!result.deletedCount)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      res.json({ message: "Đã xóa sản phẩm" });
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/products/sync", async (req, res, next) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: "Request phải chứa mảng sản phẩm JSON" });
    }

    const invalidProduct = products.find(
      (product) =>
        !product ||
        !Number.isInteger(product.id) ||
        product.id <= 0 ||
        validateProduct(normalizeProduct(product)),
    );
    const productIds = products.map((product) => product.id);
    if (invalidProduct || new Set(productIds).size !== productIds.length) {
      return res.status(400).json({ message: "Dữ liệu sản phẩm không hợp lệ" });
    }

    const collection = await getProductsCollection();
    await collection.deleteMany({});
    if (products.length) {
      await collection.insertMany(
        products.map((product) => {
          const normalized = normalizeProduct(product);
          delete normalized._id;
          return normalized;
        }),
      );
    }
    res.json({ success: true, count: products.length });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
});

const server = app.listen(PORT, () => {
  console.log(`API đang chạy tại http://localhost:${PORT}`);
  console.log(`MongoDB: ${DATABASE_NAME}.${COLLECTION_NAME}`);
});

async function shutdown() {
  server.close();
  await client.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
