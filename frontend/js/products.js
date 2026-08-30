document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const API_URL = "http://localhost:5000/api/products";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productGrid =
        document.getElementById("productGrid");

    const productsCount =
        document.getElementById("productsCount");

    const pageTitle =
        document.getElementById("pageTitle");

    const sortProducts =
        document.getElementById("sortProducts");

    const clearFiltersButton =
        document.getElementById("clearFilters");

    const searchInput =
        document.querySelector(".search-box input");

    const categoryFilters =
        document.querySelectorAll(".category-filter");

    const priceFilters =
        document.querySelectorAll(".price-filter");

    const ratingFilters =
        document.querySelectorAll(".rating-filter");


    /* =====================================================
       DATA
    ===================================================== */

    let allProducts = [];

    let displayedProducts = [];


    /* =====================================================
       GET CURRENT USER
    ===================================================== */

    function getCurrentUser() {

        try {

            const user =
                JSON.parse(
                    localStorage.getItem("velmiraUser")
                );

            return user || null;

        } catch (error) {

            console.error(
                "Error reading user:",
                error
            );

            return null;

        }

    }


    /* =====================================================
       GET USER ID
    ===================================================== */

    function getUserId() {

        const user =
            getCurrentUser();

        if (!user) {

            return null;

        }


        const id =
            user.id ||
            user._id ||
            user.userId;


        if (!id) {

            return null;

        }


        return String(id).trim();

    }


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    function getCartKey() {

        const userId =
            getUserId();

        return userId
            ? `velmiraCart_${userId}`
            : "velmiraCart";

    }


    function getWishlistKey() {

        const userId =
            getUserId();

        return userId
            ? `velmiraWishlist_${userId}`
            : "velmiraWishlist";

    }


    /* =====================================================
       LOGIN CHECK
    ===================================================== */

    function isLoggedIn() {

        const token =
            localStorage.getItem(
                "velmiraToken"
            );

        const user =
            getCurrentUser();

        return !!(
            token &&
            user &&
            getUserId()
        );

    }


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "Velmira logged in:",
        isLoggedIn()
    );

    console.log(
        "Velmira user:",
        getCurrentUser()
    );

    console.log(
        "Velmira user ID:",
        getUserId()
    );

    console.log(
        "Cart key:",
        getCartKey()
    );

    console.log(
        "Wishlist key:",
        getWishlistKey()
    );


    /* =====================================================
       URL CATEGORY
    ===================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    let selectedCategory =
        urlParams.get("category");


    /* =====================================================
       NORMALIZE CATEGORY
    ===================================================== */

    function normalizeCategory(value) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

    }


    /* =====================================================
       GET PRODUCT ID
    ===================================================== */

    function getProductId(product) {

        if (!product) {

            return "";

        }


        return String(
            product._id ||
            product.id ||
            product.productId ||
            ""
        ).trim();

    }


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    async function loadProducts() {

        if (!productGrid) {

            return;

        }


        productGrid.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">

                <i
                    class="fa-solid fa-spinner fa-spin"
                    style="font-size:30px;">
                </i>

                <p style="margin-top:12px;">
                    Loading products...
                </p>

            </div>

        `;


        try {

            const response =
                await fetch(API_URL);


            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            const data =
                await response.json();


            if (Array.isArray(data)) {

                allProducts =
                    data;

            }

            else if (
                data &&
                Array.isArray(data.products)
            ) {

                allProducts =
                    data.products;

            }

            else {

                allProducts = [];

            }


            console.log(
                "Products loaded:",
                allProducts
            );


            updatePageTitle();

            applyURLCategoryToCheckbox();

            applyAllFilters();

            updateCartCount();

        }


        catch (error) {

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
                        style="font-size:40px;">
                    </i>

                    <h3 style="margin-top:15px;">
                        Unable to load products
                    </h3>

                    <p style="
                        margin-top:10px;
                        opacity:.7;
                    ">
                        Make sure the Velmira backend
                        is running on port 5000.
                    </p>

                </div>

            `;


            if (productsCount) {

                productsCount.textContent =
                    "0 products";

            }

        }

    }


    /* =====================================================
       PAGE TITLE
    ===================================================== */

    function updatePageTitle() {

        if (!pageTitle) {

            return;

        }


        pageTitle.textContent =
            selectedCategory ||
            "All Products";

    }


    /* =====================================================
       APPLY URL CATEGORY
    ===================================================== */

    function applyURLCategoryToCheckbox() {

        if (!selectedCategory) {

            return;

        }


        categoryFilters.forEach(
            checkbox => {

                checkbox.checked =
                    normalizeCategory(
                        checkbox.value
                    ) ===
                    normalizeCategory(
                        selectedCategory
                    );

            }
        );

    }


    /* =====================================================
       APPLY ALL FILTERS
    ===================================================== */

    function applyAllFilters() {

        let products =
            [...allProducts];


        /* =================================================
           URL CATEGORY
        ================================================= */

        if (selectedCategory) {

            const category =
                normalizeCategory(
                    selectedCategory
                );


            products =
                products.filter(
                    product =>
                        normalizeCategory(
                            product.category
                        ) === category
                );

        }


        /* =================================================
           CATEGORY FILTER
        ================================================= */

        const selectedCategories =
            Array.from(
                categoryFilters
            )
            .filter(
                checkbox =>
                    checkbox.checked
            )
            .map(
                checkbox =>
                    normalizeCategory(
                        checkbox.value
                    )
            );


        if (
            selectedCategories.length > 0
        ) {

            products =
                products.filter(
                    product =>
                        selectedCategories.includes(
                            normalizeCategory(
                                product.category
                            )
                        )
                );

        }


        /* =================================================
           PRICE FILTER
        ================================================= */

        const selectedPrices =
            Array.from(
                priceFilters
            )
            .filter(
                checkbox =>
                    checkbox.checked
            )
            .map(
                checkbox =>
                    checkbox.value
            );


        if (
            selectedPrices.length > 0
        ) {

            products =
                products.filter(
                    product => {

                        const price =
                            Number(
                                product.price
                            ) || 0;


                        return selectedPrices.some(
                            range => {

                                if (
                                    range ===
                                    "under1000"
                                ) {

                                    return price < 1000;

                                }


                                if (
                                    range ===
                                    "1000-3000"
                                ) {

                                    return (
                                        price >= 1000 &&
                                        price <= 3000
                                    );

                                }


                                if (
                                    range ===
                                    "3000-5000"
                                ) {

                                    return (
                                        price > 3000 &&
                                        price <= 5000
                                    );

                                }


                                if (
                                    range ===
                                    "above5000"
                                ) {

                                    return price > 5000;

                                }


                                return false;

                            }
                        );

                    }
                );

        }


        /* =================================================
           RATING FILTER
        ================================================= */

        const selectedRatings =
            Array.from(
                ratingFilters
            )
            .filter(
                checkbox =>
                    checkbox.checked
            )
            .map(
                checkbox =>
                    Number(
                        checkbox.value
                    )
            );


        if (
            selectedRatings.length > 0
        ) {

            const minimumRating =
                Math.min(
                    ...selectedRatings
                );


            products =
                products.filter(
                    product => {

                        const rating =
                            parseFloat(
                                product.rating
                            ) || 0;


                        return (
                            rating >=
                            minimumRating
                        );

                    }
                );

        }


        /* =================================================
           SEARCH
        ================================================= */

        const searchText =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        if (searchText) {

            products =
                products.filter(
                    product => {

                        const name =
                            String(
                                product.name || ""
                            ).toLowerCase();


                        const category =
                            String(
                                product.category || ""
                            ).toLowerCase();


                        const description =
                            String(
                                product.description || ""
                            ).toLowerCase();


                        return (
                            name.includes(searchText) ||
                            category.includes(searchText) ||
                            description.includes(searchText)
                        );

                    }
                );

        }


        /* =================================================
           SORT
        ================================================= */

        const sortValue =
            sortProducts
                ? sortProducts.value
                : "default";


        if (sortValue === "low") {

            products.sort(
                (a, b) =>
                    (Number(a.price) || 0) -
                    (Number(b.price) || 0)
            );

        }


        else if (sortValue === "high") {

            products.sort(
                (a, b) =>
                    (Number(b.price) || 0) -
                    (Number(a.price) || 0)
            );

        }


        else if (sortValue === "rating") {

            products.sort(
                (a, b) =>
                    (parseFloat(b.rating) || 0) -
                    (parseFloat(a.rating) || 0)
            );

        }


        displayedProducts =
            products;


        renderProducts();

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts() {

        if (!productGrid) {

            return;

        }


        productGrid.innerHTML = "";


        if (productsCount) {

            productsCount.textContent =
                `${displayedProducts.length} ${
                    displayedProducts.length === 1
                        ? "product"
                        : "products"
                }`;

        }


        /* =================================================
           NO PRODUCTS
        ================================================= */

        if (
            displayedProducts.length === 0
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

                    <h3 style="margin-top:15px;">
                        No products found
                    </h3>

                    <p style="
                        margin-top:10px;
                        opacity:.7;
                    ">
                        Try changing your filters.
                    </p>

                </div>

            `;

            return;

        }


        /* =================================================
           CREATE PRODUCT CARDS
        ================================================= */

        displayedProducts.forEach(
            product => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "product-card";


                const id =
                    getProductId(
                        product
                    );


                const name =
                    product.name ||
                    "Product";


                const category =
                    product.category ||
                    "General";


                const price =
                    Number(
                        product.price
                    ) || 0;


                const oldPrice =
                    Number(
                        product.oldPrice
                    ) || 0;


                const image =
                    product.image ||
                    "https://via.placeholder.com/400x400?text=Velmira";


                const rating =
                    parseFloat(
                        product.rating
                    ) || 0;


                const reviews =
                    Number(
                        product.reviews
                    ) || 0;


                card.dataset.id =
                    id;


                card.innerHTML = `

                    <div
                        class="product-image"
                        style="cursor:pointer;"
                    >

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(name)}"
                            loading="lazy"
                            onerror="
                                this.src='https://via.placeholder.com/400x400?text=Velmira';
                            "
                        >

                    </div>


                    <div class="product-info">

                        <p class="product-category">

                            ${escapeHtml(category)}

                        </p>


                        <h3 style="cursor:pointer;">

                            ${escapeHtml(name)}

                        </h3>


                        <div
                            class="product-rating"
                            style="
                                margin:8px 0;
                                font-size:14px;
                            "
                        >

                            ${getStars(rating)}

                            ${
                                reviews
                                    ? `
                                        <span style="
                                            opacity:.6;
                                            margin-left:5px;
                                        ">
                                            (${reviews})
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        <div
                            class="product-price"
                            style="
                                display:flex;
                                gap:10px;
                                align-items:center;
                                margin-top:8px;
                            "
                        >

                            <strong>

                                ₹${price.toLocaleString(
                                    "en-IN"
                                )}

                            </strong>


                            ${
                                oldPrice > price
                                    ? `
                                        <del style="opacity:.5;">

                                            ₹${oldPrice.toLocaleString(
                                                "en-IN"
                                            )}

                                        </del>
                                      `
                                    : ""
                            }

                        </div>


                        <div
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:15px;
                            "
                        >

                            <button
                                class="btn primary add-to-cart"
                                data-id="${escapeHtml(id)}"
                                type="button"
                                style="
                                    flex:1;
                                    border:none;
                                    cursor:pointer;
                                "
                            >

                                <i class="
                                    fa-solid
                                    fa-bag-shopping
                                "></i>

                                Add to Cart

                            </button>


                            <button
                                class="wishlist-button"
                                data-id="${escapeHtml(id)}"
                                type="button"
                                aria-label="Add to wishlist"
                                style="
                                    width:44px;
                                    border:1px solid rgba(0,0,0,.12);
                                    background:white;
                                    border-radius:10px;
                                    cursor:pointer;
                                "
                            >

                                <i
                                    class="
                                        fa-regular
                                        fa-heart
                                    ">
                                </i>

                            </button>

                        </div>

                    </div>

                `;


                productGrid.appendChild(
                    card
                );

            }
        );


        setupProductLinks();

        setupCartButtons();

        setupWishlistButtons();

    }


    /* =====================================================
       PRODUCT LINKS
    ===================================================== */

    function setupProductLinks() {

        document
            .querySelectorAll(
                ".product-card"
            )
            .forEach(
                card => {

                    const id =
                        card.dataset.id;


                    const image =
                        card.querySelector(
                            ".product-image"
                        );


                    const title =
                        card.querySelector(
                            "h3"
                        );


                    const openProduct =
                        event => {

                            if (event) {

                                event.preventDefault();

                            }


                            if (!id) {

                                console.error(
                                    "Missing product ID"
                                );

                                return;

                            }


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

                        title.addEventListener(
                            "click",
                            openProduct
                        );

                    }

                }
            );

    }


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        const key =
            getCartKey();


        try {

            const saved =
                localStorage.getItem(
                    key
                );


            if (!saved) {

                return [];

            }


            const cart =
                JSON.parse(
                    saved
                );


            return Array.isArray(cart)
                ? cart
                : [];

        }

        catch (error) {

            console.error(
                "GET CART ERROR:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart(cart) {

        const key =
            getCartKey();


        localStorage.setItem(
            key,
            JSON.stringify(cart)
        );


        console.log(
            "Cart saved to:",
            key
        );

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    function setupCartButtons() {

        document
            .querySelectorAll(
                ".add-to-cart"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            event.stopPropagation();


                            /* =================================
                               LOGIN CHECK
                            ================================= */

                            if (!isLoggedIn()) {

                                alert(
                                    "Please login first to add products to cart."
                                );


                                window.location.href =
                                    "login.html";

                                return;

                            }


                            const id =
                                String(
                                    button.dataset.id
                                ).trim();


                            console.log(
                                "Add to cart ID:",
                                id
                            );


                            const product =
                                allProducts.find(
                                    item =>
                                        getProductId(
                                            item
                                        ) === id
                                );


                            if (!product) {

                                console.error(
                                    "Product not found:",
                                    id
                                );

                                alert(
                                    "Unable to add this product."
                                );

                                return;

                            }


                            let cart =
                                getCart();


                            const existing =
                                cart.find(
                                    item =>
                                        String(
                                            item.id
                                        ) === id
                                );


                            if (existing) {

                                existing.quantity =
                                    (
                                        Number(
                                            existing.quantity
                                        ) || 1
                                    ) + 1;

                            }

                            else {

                                cart.push({

                                    id:
                                        id,

                                    name:
                                        product.name ||
                                        "Product",

                                    category:
                                        product.category ||
                                        "",

                                    price:
                                        Number(
                                            product.price
                                        ) || 0,

                                    oldPrice:
                                        Number(
                                            product.oldPrice
                                        ) || 0,

                                    image:
                                        product.image ||
                                        "",

                                    rating:
                                        parseFloat(
                                            product.rating
                                        ) || 0,

                                    reviews:
                                        Number(
                                            product.reviews
                                        ) || 0,

                                    badge:
                                        product.badge ||
                                        "",

                                    description:
                                        product.description ||
                                        "",

                                    quantity:
                                        1

                                });

                            }


                            saveCart(
                                cart
                            );


                            updateCartCount();


                            console.log(
                                "Product added:",
                                product.name
                            );

                            console.log(
                                "Current cart:",
                                cart
                            );


                            const originalHTML =
                                button.innerHTML;


                            button.innerHTML = `

                                <i class="
                                    fa-solid
                                    fa-check
                                "></i>

                                Added

                            `;


                            setTimeout(
                                () => {

                                    button.innerHTML =
                                        originalHTML;

                                },
                                1000
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       GET WISHLIST
    ===================================================== */

    function getWishlist() {

        const key =
            getWishlistKey();


        try {

            const saved =
                localStorage.getItem(
                    key
                );


            if (!saved) {

                return [];

            }


            const wishlist =
                JSON.parse(
                    saved
                );


            return Array.isArray(
                wishlist
            )
                ? wishlist
                : [];

        }

        catch (error) {

            console.error(
                "GET WISHLIST ERROR:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       SAVE WISHLIST
    ===================================================== */

    function saveWishlist(
        wishlist
    ) {

        const key =
            getWishlistKey();


        localStorage.setItem(
            key,
            JSON.stringify(
                wishlist
            )
        );


        console.log(
            "Wishlist saved to:",
            key
        );

    }


    /* =====================================================
       WISHLIST BUTTONS
    ===================================================== */

    function setupWishlistButtons() {

        document
            .querySelectorAll(
                ".wishlist-button"
            )
            .forEach(
                button => {

                    const id =
                        String(
                            button.dataset.id
                        ).trim();


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    const wishlist =
                        getWishlist();


                    const alreadySaved =
                        wishlist.some(
                            item =>
                                String(
                                    item.id
                                ) === id
                        );


                    if (
                        alreadySaved &&
                        icon
                    ) {

                        icon.className =
                            "fa-solid fa-heart";

                    }


                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            event.stopPropagation();


                            /* =================================
                               LOGIN CHECK
                            ================================= */

                            if (!isLoggedIn()) {

                                alert(
                                    "Please login first to use wishlist."
                                );


                                window.location.href =
                                    "login.html";

                                return;

                            }


                            const product =
                                allProducts.find(
                                    item =>
                                        getProductId(
                                            item
                                        ) === id
                                );


                            if (!product) {

                                console.error(
                                    "Wishlist product not found:",
                                    id
                                );

                                return;

                            }


                            let currentWishlist =
                                getWishlist();


                            const existingIndex =
                                currentWishlist.findIndex(
                                    item =>
                                        String(
                                            item.id
                                        ) === id
                                );


                            /* =================================
                               REMOVE
                            ================================= */

                            if (
                                existingIndex !== -1
                            ) {

                                currentWishlist.splice(
                                    existingIndex,
                                    1
                                );


                                if (icon) {

                                    icon.className =
                                        "fa-regular fa-heart";

                                }


                                console.log(
                                    "Removed from wishlist:",
                                    product.name
                                );

                            }


                            /* =================================
                               ADD
                            ================================= */

                            else {

                                currentWishlist.push({

                                    id:
                                        id,

                                    name:
                                        product.name ||
                                        "Product",

                                    category:
                                        product.category ||
                                        "",

                                    price:
                                        Number(
                                            product.price
                                        ) || 0,

                                    oldPrice:
                                        Number(
                                            product.oldPrice
                                        ) || 0,

                                    image:
                                        product.image ||
                                        "",

                                    rating:
                                        parseFloat(
                                            product.rating
                                        ) || 0,

                                    reviews:
                                        Number(
                                            product.reviews
                                        ) || 0,

                                    badge:
                                        product.badge ||
                                        "",

                                    description:
                                        product.description ||
                                        ""

                                });


                                if (icon) {

                                    icon.className =
                                        "fa-solid fa-heart";

                                }


                                console.log(
                                    "Added to wishlist:",
                                    product.name
                                );

                            }


                            saveWishlist(
                                currentWishlist
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cart =
            getCart();


        const total =
            cart.reduce(
                (
                    sum,
                    item
                ) => {

                    return (
                        sum +
                        (
                            Number(
                                item.quantity
                            ) || 1
                        )
                    );

                },
                0
            );


        document
            .querySelectorAll(
                ".cart span"
            )
            .forEach(
                span => {

                    span.textContent =
                        total;

                }
            );

    }


    /* =====================================================
       CATEGORY FILTER EVENTS
    ===================================================== */

    categoryFilters.forEach(
        filter => {

            filter.addEventListener(
                "change",
                () => {

                    selectedCategory =
                        null;


                    const checked =
                        Array.from(
                            categoryFilters
                        )
                        .filter(
                            cb =>
                                cb.checked
                        );


                    if (
                        checked.length === 1
                    ) {

                        if (pageTitle) {

                            pageTitle.textContent =
                                checked[0].value;

                        }

                    }

                    else {

                        if (pageTitle) {

                            pageTitle.textContent =
                                "All Products";

                        }

                    }


                    const params =
                        new URLSearchParams(
                            window.location.search
                        );


                    params.delete(
                        "category"
                    );


                    window.history.replaceState(
                        {},
                        "",
                        `${window.location.pathname}${
                            params.toString()
                                ? "?" + params.toString()
                                : ""
                        }`
                    );


                    applyAllFilters();

                }
            );

        }
    );


    /* =====================================================
       PRICE FILTER EVENTS
    ===================================================== */

    priceFilters.forEach(
        filter => {

            filter.addEventListener(
                "change",
                applyAllFilters
            );

        }
    );


    /* =====================================================
       RATING FILTER EVENTS
    ===================================================== */

    ratingFilters.forEach(
        filter => {

            filter.addEventListener(
                "change",
                applyAllFilters
            );

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyAllFilters
        );

    }


    /* =====================================================
       SORT
    ===================================================== */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            applyAllFilters
        );

    }


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    if (clearFiltersButton) {

        clearFiltersButton.addEventListener(
            "click",
            () => {

                categoryFilters.forEach(
                    cb =>
                        cb.checked = false
                );


                priceFilters.forEach(
                    cb =>
                        cb.checked = false
                );


                ratingFilters.forEach(
                    cb =>
                        cb.checked = false
                );


                if (searchInput) {

                    searchInput.value =
                        "";

                }


                if (sortProducts) {

                    sortProducts.value =
                        "default";

                }


                selectedCategory =
                    null;


                window.history.replaceState(
                    {},
                    "",
                    window.location.pathname
                );


                if (pageTitle) {

                    pageTitle.textContent =
                        "All Products";

                }


                applyAllFilters();

            }
        );

    }


    /* =====================================================
       STARS
    ===================================================== */

    function getStars(rating) {

        const value =
            parseFloat(rating) || 0;


        if (value <= 0) {

            return `

                <span style="opacity:.5;">
                    No rating
                </span>

            `;

        }


        const rounded =
            Math.round(value);


        let stars = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            stars +=
                i <= rounded
                    ? "★"
                    : "☆";

        }


        return `

            <span>
                ${stars}
            </span>

        `;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(
            value || ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartCount();

    loadProducts();

});