package com.dacsantaynguyen;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class ProductJsonReader {
    public static void main(String[] args) {
        try {
            Path jsonPath = resolveJsonPath();
            System.out.println("Đọc file JSON: " + jsonPath);

            List<Product> products = readProducts(jsonPath);
            System.out.println("Số lượng sản phẩm: " + products.size());
            for (Product product : products) {
                System.out.println(
                    product.getId() + " - " + product.getName() +
                    " | Giá: " + product.getPrice() + "đ | Tồn kho: " + product.getStock()
                );
            }
        } catch (IOException e) {
            System.err.println("Lỗi khi đọc file JSON: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static List<Product> readProducts(Path jsonPath) throws IOException {
        try (FileReader reader = new FileReader(jsonPath.toFile())) {
            Type productListType = new TypeToken<List<Product>>() {}.getType();
            return new Gson().fromJson(reader, productListType);
        }
    }

    public static Path resolveJsonPath() {
        Path currentDir = Path.of(System.getProperty("user.dir"));
        Path rootPath = currentDir.resolve("products.json");
        if (Files.exists(rootPath)) {
            return rootPath;
        }

        Path parentPath = currentDir.resolve("..").resolve("products.json");
        if (Files.exists(parentPath)) {
            return parentPath;
        }

        throw new IllegalStateException("Không tìm thấy file products.json. Chạy lệnh Java trong thư mục gốc của project.");
    }
}
