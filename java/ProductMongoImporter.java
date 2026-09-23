package com.dacsantaynguyen;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import org.bson.Document;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class ProductMongoImporter {
    private static final String DEFAULT_URI = "mongodb://localhost:27017";
    private static final String DEFAULT_DATABASE = "dac_san_tay_nguyen";
    private static final String COLLECTION_NAME = "products";

    public static void main(String[] args) {
        String uri = getEnvironmentOrDefault("MONGODB_URI", DEFAULT_URI);
        String databaseName = getEnvironmentOrDefault("MONGODB_DATABASE", DEFAULT_DATABASE);

        try {
            Path jsonPath = ProductJsonReader.resolveJsonPath();
            List<Product> products = ProductJsonReader.readProducts(jsonPath);

            try (MongoClient client = MongoClients.create(uri)) {
                MongoDatabase database = client.getDatabase(databaseName);
                MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);

                int importedCount = 0;
                for (Product product : products) {
                    collection.replaceOne(
                        eq("id", product.getId()),
                        toDocument(product),
                        new ReplaceOptions().upsert(true)
                    );
                    importedCount++;
                }

                System.out.println("Đã import " + importedCount + " sản phẩm vào MongoDB.");
                System.out.println("Database: " + databaseName + ", collection: " + COLLECTION_NAME);
            }
        } catch (IOException e) {
            System.err.println("Lỗi khi đọc file JSON: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Không thể kết nối/import MongoDB: " + e.getMessage());
        }
    }

    private static Document toDocument(Product product) {
        return new Document("id", product.getId())
            .append("name", product.getName())
            .append("category", product.getCategory())
            .append("price", product.getPrice())
            .append("unit", product.getUnit())
            .append("origin", product.getOrigin())
            .append("image", product.getImage())
            .append("stock", product.getStock())
            .append("description", product.getDescription())
            .append("featured", product.isFeatured());
    }

    private static String getEnvironmentOrDefault(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? defaultValue : value;
    }
}