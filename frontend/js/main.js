document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       CONFIG
    ========================================= */

    const API_URL = "https://velmira-ecommerce.onrender.com/api/products";

    let allProducts = [];
    let filteredProducts = [];

    let selectedCategories = [];
    let selectedPriceRanges = [];
    let selectedRatings = [];

    let searchTerm = "";
    let sortValue = "default";


    /* =========================================
       ELEMENTS
    ========================================= */

    const productGrid =
        document.getElementById("productGrid");

    const productsCount =
        document.getElementById("productsCount");

    const pageTitle =
        document.getElementById("pageTitle");

    const sortProducts =
        document.getElementById("sortProducts");

    const searchInput =
        document.querySelector(".search-box input");


    /* =========================================
       CART COUNT
    ========================================= */

    function updateCartCount() {

        const cart =
            JSON.parse(
                localStorage.getItem("velmiraCart")
            ) || [];

        const cartCount =
            document.querySelector(".cart span");

        if (!cartCount) return;

        const total =
            cart.reduce(
                (sum, item) =>
                    sum +
                    (Number(item.quantity) || 1),
                0
            );

        cartCount.textContent = total;
    }


    updateCartCount();


    /* =========================================
       LOAD PRODUCTS
    ========================================= */

    async function loadProducts() {

        if (!productGrid) return;

        productGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px 20px;
            ">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p style="margin-top:10px;">
                    Loading products...
                </p>
            </div>
        `;


        try {

            const response =
                await fetch(API_URL);


            if (!response.ok) {

                throw new Error(
                    "Unable to load products"
                );

            }


            const data =
                await response.json();


            /*
             * Supports both:
             * [products]
             *
             * and
             * { products: [...] }
             */

            if (Array.isArray(data)) {

                allProducts = data;

            } else if (
                Array.isArray(data.products)
            ) {

                allProducts = data.products;

            } else {

                allProducts = [];

            }


            filteredProducts =
                [...allProducts];


            applyURLCategory();

            applyFilters();

        } catch (error) {

            console.error(
                "PRODUCT LOAD ERROR:",
                error
            );


            productGrid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:50px 20px;
                ">
                    <i
                        class="fa-solid fa-triangle-exclamation"
                        style="font-size:30px;">
                    </i>

                    <h3 style="margin-top:15px;">
                        Unable to load products
                    </h3>

                    <p style="opacity:.7;">
                        Please make sure the Velmira backend
                        is running on port 5000.
                    </p>
                </div>
            `;

        }

    }


    /* =========================================
       URL CATEGORY
    ========================================= */

    function applyURLCategory() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const category =
            params.get("category");


        if (!category) {

            selectedCategories = [];

            if (pageTitle) {

                pageTitle.textContent =
                    "All Products";

            }

            return;

        }


        /*
         * Decode URL category and normalize it.
         */

        const decodedCategory =
            decodeURIComponent(category)
                .trim();


        selectedCategories =
            [decodedCategory];


        if (pageTitle) {

            pageTitle.textContent =
                decodedCategory;

        }


        /*
         * Automatically check the matching
         * category checkbox.
         */

        document
            .querySelectorAll(".category-filter")
            .forEach(checkbox => {

                checkbox.checked =
                    normalizeCategory(
                        checkbox.value
                    ) ===
                    normalizeCategory(
                        decodedCategory
                    );

            });

    }


    /* =========================================
       CATEGORY NORMALIZATION
    ========================================= */

    function normalizeCategory(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }


    /* =========================================
       GET PRODUCT CATEGORY
    ========================================= */

    function getProductCategory(product) {

        return (
            product.category ||
            product.categoryName ||
            product.type ||
            ""
        );

    }


    /* =========================================
       GET PRODUCT PRICE
    ========================================= */

    function getProductPrice(product) {

        return Number(
            product.price ||
            product.salePrice ||
            0
        );

    }


    /* =========================================
       GET PRODUCT RATING
    ========================================= */

    function getProductRating(product) {

        return Number(
            product.rating ||
            product.ratings ||
            0
        );

    }


    /* =========================================
       APPLY ALL FILTERS
    ========================================= */

    function applyFilters() {

        let result =
            [...allProducts];


        /* =========================
           CATEGORY
        ========================= */

        if (selectedCategories.length > 0) {

            result =
                result.filter(product => {

                    const productCategory =
                        normalizeCategory(
                            getProductCategory(product)
                        );


                    return selectedCategories.some(
                        category =>
                            productCategory ===
                            normalizeCategory(category)
                    );

                });

        }


        /* =========================
           SEARCH
        ========================= */

        if (searchTerm) {

            const search =
                searchTerm.toLowerCase();


            result =
                result.filter(product => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const category =
                        String(
                            getProductCategory(product)
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        category.includes(search) ||
                        description.includes(search)
                    );

                });

        }


        /* =========================
           PRICE FILTER
        ========================= */

        if (
            selectedPriceRanges.length > 0
        ) {

            result =
                result.filter(product => {

                    const price =
                        getProductPrice(product);


                    return selectedPriceRanges.some(
                        range => {

                            if (
                                range === "under1000"
                            ) {

                                return price < 1000;

                            }


                            if (
                                range === "1000to3000"
                            ) {

                                return (
                                    price >= 1000 &&
                                    price <= 3000
                                );

                            }


                            if (
                                range === "3000to5000"
                            ) {

                                return (
                                    price > 3000 &&
                                    price <= 5000
                                );

                            }


                            if (
                                range === "above5000"
                            ) {

                                return price > 5000;

                            }


                            return true;

                        }
                    );

                });

        }


        /* =========================
           RATING FILTER
        ========================= */

        if (
            selectedRatings.length > 0
        ) {

            result =
                result.filter(product => {

                    const rating =
                        getProductRating(product);


                    return selectedRatings.some(
                        minimumRating =>
                            rating >= minimumRating
                    );

                });

        }


        /* =========================
           SORT
        ========================= */

        if (sortValue === "low") {

            result.sort(
                (a, b) =>
                    getProductPrice(a) -
                    getProductPrice(b)
            );

        }


        if (sortValue === "high") {

            result.sort(
                (a, b) =>
                    getProductPrice(b) -
                    getProductPrice(a)
            );

        }


        if (sortValue === "rating") {

            result.sort(
                (a, b) =>
                    getProductRating(b) -
                    getProductRating(a)
            );

        }


        /*
         * Featured:
         *
         * Products with higher ratings first,
         * then preserve their original order.
         */

        if (sortValue === "default") {

            result.sort(
                (a, b) =>
                    getProductRating(b) -
                    getProductRating(a)
            );

        }


        filteredProducts = result;

        renderProducts();

    }


    /* =========================================
       RENDER PRODUCTS
    ========================================= */

    function renderProducts() {

        if (!productGrid) return;


        if (productsCount) {

            productsCount.textContent =
                `${filteredProducts.length} ${
                    filteredProducts.length === 1
                        ? "product"
                        : "products"
                }`;

        }


        if (
            filteredProducts.length === 0
        ) {

            productGrid.innerHTML = `

                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:60px 20px;
                ">

                    <i
                        class="fa-solid fa-box-open"
                        style="
                            font-size:42px;
                            opacity:.5;
                        ">
                    </i>

                    <h3 style="
                        margin-top:15px;
                    ">
                        No products found
                    </h3>

                    <p style="
                        opacity:.7;
                        margin-top:8px;
                    ">
                        Try another category or filter.
                    </p>

                </div>

            `;

            return;

        }


        productGrid.innerHTML =
            filteredProducts
                .map(product =>
                    createProductCard(product)
                )
                .join("");


        attachProductEvents();

    }


    /* =========================================
       PRODUCT CARD
    ========================================= */

    function createProductCard(product) {

        const id =
            product._id ||
            product.id ||
            "";


        const name =
            product.name ||
            "Product";


        const category =
            getProductCategory(product) ||
            "General";


        const price =
            getProductPrice(product);


        const oldPrice =
            Number(
                product.oldPrice ||
                product.originalPrice ||
                0
            );


        const image =
            product.image ||
            product.imageUrl ||
            product.img ||
            "https://via.placeholder.com/400x400?text=Velmira";


        const rating =
            getProductRating(product);


        const safeName =
            escapeHTML(name);


        const safeCategory =
            escapeHTML(category);


        const formattedPrice =
            price.toLocaleString("en-IN");


        const formattedOldPrice =
            oldPrice > 0
                ? oldPrice.toLocaleString("en-IN")
                : "";


        return `

            <article
                class="product-card"
                data-id="${escapeHTML(id)}"
            >

                <div
                    class="product-image"
                    style="
                        cursor:pointer;
                    "
                >

                    <img
                        src="${escapeHTML(image)}"
                        alt="${safeName}"
                        loading="lazy"
                        onerror="
                            this.src='https://via.placeholder.com/400x400?text=Velmira'
                        "
                    >

                </div>


                <div class="product-info">

                    <span class="product-category">
                        ${safeCategory}
                    </span>


                    <h3>
                        ${safeName}
                    </h3>


                    ${
                        rating > 0
                        ? `
                            <div
                                style="
                                    margin:7px 0;
                                    font-size:13px;
                                "
                            >
                                ★ ${rating.toFixed(1)}
                            </div>
                          `
                        : ""
                    }


                    <div class="product-price">

                        <strong>
                            ₹${formattedPrice}
                        </strong>

                        ${
                            formattedOldPrice
                            ? `
                                <del>
                                    ₹${formattedOldPrice}
                                </del>
                              `
                            : ""
                        }

                    </div>


                    <div
                        class="product-actions"
                        style="
                            display:flex;
                            gap:8px;
                            margin-top:12px;
                        "
                    >

                        <button
                            class="btn primary add-to-cart"
                            type="button"
                        >
                            <i
                                class="fa-solid fa-bag-shopping">
                            </i>

                            Add to Cart
                        </button>


                        <button
                            class="wishlist-btn"
                            type="button"
                            aria-label="Add to wishlist"
                        >

                            <i
                                class="fa-regular fa-heart">
                            </i>

                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    /* =========================================
       ESCAPE HTML
    ========================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================
       PRODUCT EVENTS
    ========================================= */

    function attachProductEvents() {

        /*
         * Product card click
         */

        document
            .querySelectorAll(".product-card")
            .forEach(card => {

                const image =
                    card.querySelector(
                        ".product-image"
                    );


                const title =
                    card.querySelector("h3");


                const openProduct =
                    () => {

                        const id =
                            card.dataset.id;


                        if (!id) return;


                        window.location.href =
                            `product.html?id=${encodeURIComponent(id)}`;

                    };


                if (image) {

                    image.addEventListener(
                        "click",
                        openProduct
                    );

                }


                if (title) {

                    title.style.cursor =
                        "pointer";


                    title.addEventListener(
                        "click",
                        openProduct
                    );

                }

            });


        /*
         * Add to cart
         */

        document
            .querySelectorAll(".add-to-cart")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const card =
                            button.closest(
                                ".product-card"
                            );


                        if (!card) return;


                        const id =
                            card.dataset.id;


                        const product =
                            allProducts.find(
                                item =>
                                    String(
                                        item._id ||
                                        item.id
                                    ) ===
                                    String(id)
                            );


                        if (!product) return;


                        let cart =
                            JSON.parse(
                                localStorage.getItem(
                                    "velmiraCart"
                                )
                            ) || [];


                        const existing =
                            cart.find(
                                item =>
                                    String(
                                        item._id ||
                                        item.id
                                    ) ===
                                    String(id)
                            );


                        if (existing) {

                            existing.quantity =
                                (
                                    Number(
                                        existing.quantity
                                    ) || 1
                                ) + 1;

                        } else {

                            cart.push({

                                ...product,

                                quantity: 1

                            });

                        }


                        localStorage.setItem(
                            "velmiraCart",
                            JSON.stringify(cart)
                        );


                        updateCartCount();


                        const original =
                            button.innerHTML;


                        button.innerHTML =
                            `
                            <i class="
                                fa-solid
                                fa-check
                            "></i>
                            Added
                            `;


                        setTimeout(
                            () => {

                                button.innerHTML =
                                    original;

                            },
                            1000
                        );

                    }
                );

            });


        /*
         * Wishlist
         */

        document
            .querySelectorAll(".wishlist-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const card =
                            button.closest(
                                ".product-card"
                            );


                        if (!card) return;


                        const id =
                            card.dataset.id;


                        const product =
                            allProducts.find(
                                item =>
                                    String(
                                        item._id ||
                                        item.id
                                    ) ===
                                    String(id)
                            );


                        if (!product) return;


                        let wishlist =
                            JSON.parse(
                                localStorage.getItem(
                                    "velmiraWishlist"
                                )
                            ) || [];


                        const index =
                            wishlist.findIndex(
                                item =>
                                    String(
                                        item._id ||
                                        item.id
                                    ) ===
                                    String(id)
                            );


                        const icon =
                            button.querySelector("i");


                        if (index >= 0) {

                            wishlist.splice(
                                index,
                                1
                            );


                            icon.className =
                                "fa-regular fa-heart";

                        } else {

                            wishlist.push(product);


                            icon.className =
                                "fa-solid fa-heart";

                        }


                        localStorage.setItem(
                            "velmiraWishlist",
                            JSON.stringify(
                                wishlist
                            )
                        );

                    }
                );

            });

    }


    /* =========================================
       CATEGORY CHECKBOXES
    ========================================= */

    document
        .querySelectorAll(".category-filter")
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    selectedCategories =
                        Array.from(
                            document.querySelectorAll(
                                ".category-filter:checked"
                            )
                        ).map(
                            item => item.value
                        );


                    /*
                     * If one or more checkboxes
                     * are selected, remove the URL
                     * category so the filter is controlled
                     * by the checkboxes.
                     */

                    const params =
                        new URLSearchParams(
                            window.location.search
                        );


                    if (
                        selectedCategories.length === 1
                    ) {

                        params.set(
                            "category",
                            selectedCategories[0]
                        );

                    } else {

                        params.delete(
                            "category"
                        );

                    }


                    const newURL =
                        selectedCategories.length > 0
                            ? `${window.location.pathname}?${params.toString()}`
                            : window.location.pathname;


                    window.history.replaceState(
                        {},
                        "",
                        newURL
                    );


                    if (pageTitle) {

                        pageTitle.textContent =
                            selectedCategories.length === 1
                                ? selectedCategories[0]
                                : "All Products";

                    }


                    applyFilters();

                }
            );

        });


    /* =========================================
       SEARCH
    ========================================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                searchTerm =
                    searchInput.value.trim();


                applyFilters();

            }
        );

    }


    /* =========================================
       SORT
    ========================================= */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            () => {

                sortValue =
                    sortProducts.value;


                applyFilters();

            }
        );

    }


    /* =========================================
       PRICE FILTERS
    ========================================= */

    const priceCheckboxes =
        document.querySelectorAll(
            ".filter-group:nth-of-type(2) input[type='checkbox']"
        );


    const priceValues = [
        "under1000",
        "1000to3000",
        "3000to5000",
        "above5000"
    ];


    priceCheckboxes.forEach(
        (checkbox, index) => {

            checkbox.dataset.priceRange =
                priceValues[index];


            checkbox.addEventListener(
                "change",
                () => {

                    selectedPriceRanges =
                        Array.from(
                            priceCheckboxes
                        )
                        .filter(
                            item => item.checked
                        )
                        .map(
                            item =>
                                item.dataset.priceRange
                        );


                    applyFilters();

                }
            );

        }
    );


    /* =========================================
       RATING FILTERS
    ========================================= */

    const ratingCheckboxes =
        document.querySelectorAll(
            ".filter-group:nth-of-type(3) input[type='checkbox']"
        );


    if (ratingCheckboxes[0]) {

        ratingCheckboxes[0]
            .dataset.minimumRating = "5";

    }


    if (ratingCheckboxes[1]) {

        ratingCheckboxes[1]
            .dataset.minimumRating = "4";

    }


    ratingCheckboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    selectedRatings =
                        Array.from(
                            ratingCheckboxes
                        )
                        .filter(
                            item => item.checked
                        )
                        .map(
                            item =>
                                Number(
                                    item.dataset.minimumRating
                                )
                        );


                    applyFilters();

                }
            );

        }
    );


    /* =========================================
       START
    ========================================= */

    loadProducts();

});

