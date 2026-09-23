const { MongoClient } = require("mongodb");
const fs = require("fs");

// Đường dẫn kết nối MongoDB (thay đổi nếu bạn dùng MongoDB Atlas)
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function importData() {
  try {
    // 1. Kết nối tới MongoDB
    await client.connect();
    console.log("Đã kết nối thành công tới MongoDB!");

    // 2. Chọn Database và Collection
    const db = client.db("dacsantaynguyennn");
    const collection = db.collection("sanpham");

    // 3. Đọc file JSON từ máy tính
    const rawData = fs.readFileSync("products.json", "utf-8");
    const documents = JSON.parse(rawData);

    // 4. Đẩy toàn bộ dữ liệu vào Collection (sử dụng insertMany cho mảng JSON)
    const result = await collection.insertMany(documents);
    console.log(
      `Đã đẩy thành công ${result.insertedCount} tài liệu vào MongoDB!`,
    );
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  } finally {
    // Đóng kết nối
    await client.close();
  }
}

importData();
