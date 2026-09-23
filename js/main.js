document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.querySelector("#productList");
  const productCount = document.querySelector("#productCount");
  const emptyMessage = document.querySelector("#emptyMessage");
  const filterButton = document.querySelector("#filterButton");
  const productSearch = document.querySelector("#productSearch");
  const searchToggle = document.querySelector("#searchToggle");
  const quickSearchPanel = document.querySelector("#quickSearchPanel");
  const quickSearchInput = document.querySelector("#quickSearchInput");
  const filterStorageKey = "dacsantaynguyen_product_filters";
  const productCacheKey = "dacsantaynguyen_products_cache";
  const fallbackProducts = [
    {
      id: 1,
      name: "Cà phê Buôn Ma Thuột",
      category: "Cà phê",
      price: 180000,
      unit: "500g",
      origin: "Đắk Lắk",
      image: "images/ca-phe.jpg",
      stock: 50,
      description:
        "Cà phê rang xay đậm đà, hương thơm đặc trưng của vùng Buôn Ma Thuột.",
      featured: true,
    },
    {
      id: 2,
      name: "Mật ong rừng Tây Nguyên",
      category: "Mật ong",
      price: 250000,
      unit: "500ml",
      origin: "Đắk Lắk",
      image: "images/mat-ong.jpg",
      stock: 35,
      description:
        "Mật ong có vị ngọt dịu và hương thơm tự nhiên từ hoa rừng Tây Nguyên.",
      featured: true,
    },
    {
      id: 3,
      name: "Mắc ca Tây Nguyên",
      category: "Hạt dinh dưỡng",
      price: 220000,
      unit: "500g",
      origin: "Tây Nguyên",
      image: "images/mac-ca.jpg",
      stock: 40,
      description:
        "Hạt mắc ca béo bùi, thơm ngon, thích hợp dùng trực tiếp hoặc làm quà.",
      featured: true,
    },
    {
      id: 4,
      name: "Tiêu Tây Nguyên",
      category: "Gia vị",
      price: 140000,
      unit: "500g",
      origin: "Tây Nguyên",
      image: "images/tieu-tay-nguyen.jpg",
      stock: 60,
      description:
        "Tiêu thơm cay, đậm vị, được trồng tại vùng đất bazan màu mỡ.",
      featured: false,
    },
    {
      id: 5,
      name: "Bơ sáp Đắk Lắk",
      category: "Nông sản",
      price: 90000,
      unit: "1kg",
      origin: "Đắk Lắk",
      image: "images/bo-sap.jpg",
      stock: 25,
      description:
        "Bơ sáp dẻo, béo ngậy, thích hợp ăn trực tiếp hoặc chế biến món ăn.",
      featured: true,
    },
    {
      id: 6,
      name: "Thổ cẩm Tây Nguyên",
      category: "Thủ công mỹ nghệ",
      price: 320000,
      unit: "Sản phẩm",
      origin: "Kon Tum",
      image: "images/tho-cam-tay-nguyen.jpg",
      stock: 15,
      description:
        "Sản phẩm thủ công mang hoa văn và nét văn hóa đặc trưng của đồng bào Tây Nguyên.",
      featured: true,
    },
    {
      id: 7,
      name: "Cà phê chồn Tây Nguyên",
      category: "Cà phê",
      price: 450000,
      unit: "250g",
      origin: "Đắk Lắk",
      image: "images/caphechon.jpg",
      stock: 18,
      description: "Cà phê đặc sản có hương thơm nổi bật và hậu vị đậm đà.",
      featured: false,
    },
    {
      id: 8,
      name: "Hạt điều rang muối",
      category: "Hạt dinh dưỡng",
      price: 160000,
      unit: "500g",
      origin: "Đắk Lắk",
      image: "images/hatdieurangmuoi.jpg",
      stock: 30,
      description:
        "Hạt điều rang muối giòn bùi, phù hợp làm món ăn vặt hoặc quà tặng.",
      featured: false,
    },
    {
      id: 9,
      name: "Khô bò một nắng",
      category: "Đặc sản khô",
      price: 280000,
      unit: "500g",
      origin: "Gia Lai",
      image: "images/khobo.jpg",
      stock: 20,
      description:
        "Thịt bò được phơi một nắng, giữ vị ngọt tự nhiên và thơm ngon.",
      featured: true,
    },
    {
      id: 10,
      name: "Muối kiến vàng",
      category: "Gia vị",
      price: 90000,
      unit: "200g",
      origin: "Gia Lai",
      image: "images/muoikienvang.jpg",
      stock: 22,
      description:
        "Đặc sản gia vị độc đáo với vị chua, cay, mặn đặc trưng của Tây Nguyên.",
      featured: false,
    },
  ];

  const resolveAssetUrl = (value) => {
    if (!value) return "";
    try {
      return new URL(value, window.location.href).toString();
    } catch (error) {
      return value;
    }
  };

  const readCachedProducts = () => {
    try {
      const raw = localStorage.getItem(productCacheKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const writeCachedProducts = (list) => {
    try {
      localStorage.setItem(productCacheKey, JSON.stringify(list));
    } catch (error) {
      console.warn("Không thể lưu cache sản phẩm:", error);
    }
  };

  let products = readCachedProducts();

  try {
    const response = await fetch("/api/products", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const jsonProducts = await response.json();
    if (!Array.isArray(jsonProducts) || !jsonProducts.length) {
      throw new Error("API sản phẩm không hợp lệ");
    }

    products = jsonProducts;
    writeCachedProducts(products);
  } catch (error) {
    console.warn(
      "Không thể nạp dữ liệu từ API, đang dùng dữ liệu dự phòng cục bộ:",
      error,
    );
    products = readCachedProducts();
    if (!products.length) {
      products = fallbackProducts;
      writeCachedProducts(products);
    }
    if (!products.length) {
      console.error("Không có dữ liệu sản phẩm nào để hiển thị.");
    }
  }

  const loadSavedFilters = () => {
    try {
      const raw = localStorage.getItem(filterStorageKey);
      if (!raw) return { search: "", categories: [] };
      const parsed = JSON.parse(raw);
      return {
        search: typeof parsed.search === "string" ? parsed.search : "",
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      };
    } catch (error) {
      return { search: "", categories: [] };
    }
  };

  const saveFilters = () => {
    const search = productSearch?.value.trim() || "";
    const categories = [
      ...document.querySelectorAll('input[name="category"]:checked'),
    ].map((input) => input.value);

    try {
      localStorage.setItem(
        filterStorageKey,
        JSON.stringify({ search, categories }),
      );
    } catch (error) {
      console.warn("Không thể lưu bộ lọc sản phẩm:", error);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

  function productCard(product) {
    const imageUrl = resolveAssetUrl(product.image);
    return ` 
      <article class="product-card"> 
        <img src="${imageUrl}" alt="${product.name}">
        <div class="product-body">
          ${product.featured ? '<span class="tag">Nổi bật</span>' : ""}
          <h2>${product.name}</h2> 
          <p>${product.description}</p>
          <p><strong>Danh mục:</strong> ${product.category}</p>
          <p><strong>Xuất xứ:</strong> ${product.origin}</p>
          <p><strong>Còn:</strong> ${product.stock} ${product.unit}</p>
          <strong class="price">${formatPrice(product.price)} / ${product.unit}</strong>
          <a class="text-link" href="chi-tiet-san-pham.html?id=${product.id}">Xem chi tiết →</a>
        </div>
      </article>`;
  }

  function renderProducts(list) {
    if (!productList) return;
    productList.innerHTML = list.map(productCard).join("");
    if (productCount)
      productCount.innerHTML = `<strong>${list.length} sản phẩm</strong> được giới thiệu`;
    if (emptyMessage) emptyMessage.hidden = list.length !== 0;
  }

  if (productList) {
    const normalizeText = (text) =>
      text
        .toLocaleLowerCase("vi-VN")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    const savedFilters = loadSavedFilters();
    if (productSearch) {
      productSearch.value = savedFilters.search;
    }

    document.querySelectorAll('input[name="category"]').forEach((input) => {
      input.checked = savedFilters.categories.includes(input.value);
    });

    const updateProductList = () => {
      const keyword = normalizeText(productSearch?.value.trim() || "");
      const checkedCategories = [
        ...document.querySelectorAll('input[name="category"]:checked'),
      ].map((input) => input.value);
      const filtered = products.filter((product) => {
        const matchesKeyword = normalizeText(product.name).includes(keyword);
        const matchesCategory =
          checkedCategories.length === 0 ||
          checkedCategories.includes(product.category);
        return matchesKeyword && matchesCategory;
      });

      renderProducts(filtered);
      saveFilters();
    };

    productSearch?.addEventListener("input", updateProductList);
    document.querySelectorAll('input[name="category"]').forEach((input) => {
      input.addEventListener("change", updateProductList);
    });

    if (filterButton) {
      filterButton.addEventListener("click", updateProductList);
    }

    const initialSearch =
      new URLSearchParams(window.location.search).get("search") || "";
    if (initialSearch && productSearch) {
      productSearch.value = initialSearch;
    }

    updateProductList();
  }

  if (searchToggle && quickSearchPanel) {
    searchToggle.addEventListener("click", () => {
      const isOpen = !quickSearchPanel.hidden;
      quickSearchPanel.hidden = isOpen;
      searchToggle.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) quickSearchInput?.focus();
    });

    quickSearchPanel.addEventListener("submit", (event) => {
      event.preventDefault();
      const search = quickSearchInput?.value.trim() || "";
      window.location.href = `san-pham.html${search ? `?search=${encodeURIComponent(search)}` : ""}`;
    });
  }

  const featuredList = document.querySelector("#featuredList");
  if (featuredList) {
    featuredList.innerHTML = products
      .filter((product) => product.featured)
      .slice(0, 4)
      .map(productCard)
      .join("");
  }

  const detailContainer = document.querySelector("#productDetail");
  if (detailContainer) {
    const id =
      Number(new URLSearchParams(window.location.search).get("id")) || 1;
    const product = products.find((item) => item.id === id) || products[0];

    document.title = `Giỏ hàng - ${product.name} - Đặc Sản Tây Nguyên`;
    detailContainer.innerHTML = `
      <div class="detail-image">
        <img src="${resolveAssetUrl(product.image)}" alt="${product.name}">
      </div>
      <div class="detail-content">
        ${product.featured ? '<span class="tag">Đặc sản nổi bật</span>' : '<span class="tag">Đặc sản Tây Nguyên</span>'}
        <h2>${product.name}</h2>
        <p class="detail-price">${formatPrice(product.price)} / ${product.unit}</p>
        <p>${product.description}</p>
        <dl class="product-info">
          <div><dt>Danh mục</dt><dd>${product.category}</dd></div>
          <div><dt>Xuất xứ</dt><dd>${product.origin}</dd></div>
          <div><dt>Đơn vị</dt><dd>${product.unit}</dd></div>
          <div><dt>Tồn kho</dt><dd>${product.stock}</dd></div>
        </dl>
        <div class="button-group">
          <button class="btn btn-primary" type="button" id="cartButton">Thêm vào giỏ hàng</button>
          <a class="btn btn-outline" href="lien-he.html?id=${product.id}">Liên hệ tư vấn</a>
        </div>
        <p class="status-message" id="cartMessage" aria-live="polite"></p>
      </div>`;

    const relatedGrid = document.querySelector("#relatedList");
    if (relatedGrid) {
      relatedGrid.innerHTML = products
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
        .map(productCard)
        .join("");
    }

    document.querySelector("#cartButton")?.addEventListener("click", () => {
      const message = document.querySelector("#cartMessage");
      if (message)
        message.textContent = `Đã thêm ${product.name} vào giỏ hàng (mô phỏng).`;
    });
  }

  const productSelect = document.querySelector("#product");
  if (productSelect) {
    const selectedId = Number(
      new URLSearchParams(window.location.search).get("id"),
    );
    productSelect.innerHTML =
      '<option value="">-- Chọn sản phẩm --</option>' +
      products
        .map(
          (product) => `<option value="${product.id}">${product.name}</option>`,
        )
        .join("");
    if (selectedId) productSelect.value = String(selectedId);
  }

  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = document.querySelector("#formMessage");
      if (message)
        message.textContent =
          "Cảm ơn bạn! Yêu cầu tư vấn đã được ghi nhận (mô phỏng giao diện tĩnh).";
      contactForm.reset();
    });
  }
});
