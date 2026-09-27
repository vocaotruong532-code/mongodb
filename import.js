const fs = require("fs");
const path = require("path");

const apiUrl = process.env.API_URL || "http://localhost:3001/api/products/sync";

async function importData() {
  const filePath = path.join(__dirname, "products.json");
  const products = JSON.parse(await fs.promises.readFile(filePath, "utf8"));
  if (!Array.isArray(products)) {
    throw new Error("products.json phải chứa một mảng sản phẩm");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(products),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `API trả về HTTP ${response.status}`);
  }

  console.log(`Đã đồng bộ ${result.count} sản phẩm qua API vào MongoDB.`);
}

importData().catch((error) => {
  console.error("Không thể đồng bộ sản phẩm:", error.message);
  process.exitCode = 1;
});
