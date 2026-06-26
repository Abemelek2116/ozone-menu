/*=========================================================
    OZONE Digital Menu Engine
    Version: 1.0.6

    Author: ABEX Software Solutions
    Client Architecture: OZONE HOTEL

    This file controls the complete customer menu.
==========================================================*/

"use strict";

/*=========================================================
    APPLICATION CLASS DEFINITION
==========================================================*/
class OzoneMenu {
    constructor() {
        /* -------------------------------
            Data Models
        ------------------------------- */
        this.menuItems = [];
        this.filteredItems = [];
        this.categories = [];

        /* -------------------------------
            Current State Flag Configs
        ------------------------------- */
        this.language = localStorage.getItem("ozone-lang") || "en";
        this.theme = localStorage.getItem("ozone-theme") || "dark";

        /* -------------------------------
            Active Live Filter Rules
        ------------------------------- */
        this.filters = {
            category: "all",
            search: "",
            price: { min: 0, max: Infinity },
            calories: { min: 0, max: Infinity },
            availability: true,
            featuredOnly: false,
            chefOnly: false,
            seasonalOnly: false,
            dailySpecialOnly: false
        };

        /* -------------------------------
            Sorting Directives
        ------------------------------- */
        this.sortBy = "featured";

        /* -------------------------------
            Shopping Cart Interceptor Contexts
        ------------------------------- */
        this.favorites = [];
        this.elements = {};
        this.ready = false;
    }
}

/*=========================================================
    UI TEMPLATE RENDERING PROTOTYPES (Collision-Free)
==========================================================*/

// Generates the standard food card item layout for grids
OzoneMenu.prototype.renderFoodCard = function (item, lang = "en", currencySymbol = "ETB") {
    const escape = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

    const name = item.name && typeof item.name === "object" ? (item.name[lang] || item.name.en || "") : (item.name || "");
    const description = item.description ? (typeof item.description === "object" ? (item.description[lang] || item.description.en || "") : item.description) : "";

    // Flat price (cafe/restaurant/bar data) or object price (menu.json data)
    const price = typeof item.price === "object" ? (item.price.medium || item.price.standard || Object.values(item.price)[0] || 0) : (item.price || 0);
    const currency = item.currency || currencySymbol;
    const fallbackImg = item.images && item.images.length ? item.images[0] : (item.image || "");

    // Badges: array of strings OR array of objects
    let badgeHTML = "";
    const badges = item.badges || (item.badge ? [item.badge] : []);
    if (badges.length) {
        const b = typeof badges[0] === "object" ? badges[0].text : badges[0];
        badgeHTML = `<span class="badge best">${escape(b)}</span>`;
    }

    return `
        <div class="food-card hover-3d" data-id="${item.id}">
            <div class="image">
                <img src="../${fallbackImg}" alt="${escape(name)}" loading="lazy"
                     onerror="this.style.opacity='0.3'">
                ${badgeHTML}
            </div>
            <div class="content">
                <span class="category-tag" style="font-size:11px;text-transform:uppercase;opacity:0.5;letter-spacing:2px">${escape(item.category || "")}</span>
                <h3>${escape(name)}</h3>
                <p>${escape(description)}</p>
                <div class="price">
                    ${item.oldPrice ? `<del>${currency} ${item.oldPrice}</del>` : ""}
                    <span>${price.toLocaleString()} ${currency}</span>
                </div>
                <button class="add-to-cart" data-id="${item.id}" data-i18n="mp.card.add">${(window.OZONE_I18N && window.OZONE_I18N.t("mp.card.add")) || "Add to Cart"}</button>
            </div>
        </div>
    `;
};

// Generates Category Navigation Filter Controls
OzoneMenu.prototype.renderCategoryCard = function (categoryId) {
    return `
        <button class="category-card" data-category="${categoryId}">
            ${categoryId}
        </button>
    `;
};

// Detailed Item Modal View overlay
OzoneMenu.prototype.renderFoodModal = function (item, lang = "en", currencySymbol = "ETB") {
    const t = key => (window.OZONE_I18N && window.OZONE_I18N.t(key)) || key;
    const escape = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const name = item.name && typeof item.name === "object" ? (item.name[lang] || item.name.en || "") : (item.name || "");
    const description = item.description ? (typeof item.description === "object" ? (item.description[lang] || item.description.en || "") : item.description) : "";
    const price = typeof item.price === "object" ? (item.price.medium || item.price.standard || Object.values(item.price)[0] || 0) : (item.price || 0);
    const currency = item.currency || currencySymbol;
    const fallbackImg = item.images && item.images.length ? item.images[0] : (item.image || "");

    let sizesHTML = `<button class="size-btn active" data-size="standard" data-price="${price}">${t("mp.modal.std")} — ${price.toLocaleString()} ${currency}</button>`;
    if (typeof item.price === "object") {
        sizesHTML = Object.entries(item.price).map(([key, val], i) =>
            `<button class="size-btn${i === 0 ? " active" : ""}" data-size="${key}" data-price="${val}">
                ${key.charAt(0).toUpperCase() + key.slice(1)} — ${Number(val).toLocaleString()} ${currency}
             </button>`
        ).join("");
    }

    return `
        <div id="foodModal" class="ozone-modal">
            <div class="modal-overlay"></div>
            <div class="modal-container" style="grid-template-columns:1fr;max-width:520px">
                <button class="modal-close" style="position:absolute;top:15px;right:15px;background:rgba(255,255,255,.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:1.2rem;cursor:pointer;z-index:2">&times;</button>
                <div class="modal-info" style="position:relative">
                    <img id="modalMainImage" src="../${fallbackImg}" alt="${escape(name)}"
                         style="width:100%;max-height:240px;object-fit:cover;border-radius:16px;margin-bottom:15px"
                         onerror="this.style.display='none'">
                    <h2 style="font-size:1.6rem;margin-bottom:6px">${escape(name)}</h2>
                    <p style="margin-bottom:12px">${escape(description)}</p>
                    <p class="modal-price" style="font-size:1.3rem;font-weight:700;color:var(--gold);margin-bottom:16px">${price.toLocaleString()} ${currency}</p>

                    <div class="size-options" style="flex-wrap:wrap;margin-bottom:14px">${sizesHTML}</div>

                    <div class="addon-list" style="margin-bottom:14px;max-height:130px;overflow-y:auto">
                        ${(item.addons || []).map(addon => {
                            const aName = addon.name && typeof addon.name === "object" ? (addon.name[lang] || addon.name.en || "") : (addon.name || "");
                            return `<label class="addon-item">
                                <span><input type="checkbox" value="${addon.id}" style="margin-right:8px"> ${escape(aName)}</span>
                                <strong>+${addon.price} ${currency}</strong>
                            </label>`;
                        }).join("")}
                    </div>

                    <textarea id="kitchenNotes" placeholder="${t("mp.modal.notes")}"
                              style="width:100%;height:60px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:inherit;padding:10px;resize:none;font-family:inherit"></textarea>

                    <div class="modal-footer">
                        <div class="quantity-selector">
                            <button id="modalQtyMinus">−</button>
                            <span id="modalQty">1</span>
                            <button id="modalQtyPlus">+</button>
                        </div>
                        <button id="modalAddCart" class="btn-primary" style="flex:1;margin-left:12px">${t("mp.modal.add")}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Empty state fallback visual template
OzoneMenu.prototype.renderEmptyState = function () {
    const t = key => (window.OZONE_I18N && window.OZONE_I18N.t(key)) || key;
    return `
        <div class="no-results-found" style="grid-column: 1/-1; text-align: center; padding: 60px; opacity: 0.7;">
            <i class="fas fa-search" style="font-size:2.5rem;color:var(--gold);margin-bottom:20px;display:block"></i>
            <p>${t("mp.cart.empty.p")}</p>
        </div>
    `;
};

/*=========================================================
    CACHE DOM OBJECT INTERFACES
==========================================================*/
OzoneMenu.prototype.cacheDOM = function () {
    this.elements = {
        menuContainer: document.getElementById("menuContainer") || document.querySelector(".menu-grid"),
        searchInput: document.getElementById("searchInput") || document.getElementById("menuSearch"),
        categoryFilter: document.getElementById("categoryFilter") || document.getElementById("categoryContainer"),
        sortSelect: document.getElementById("sortSelect") || document.getElementById("sortMenu"),
        loader: document.getElementById("menuLoader")
    };
};

/*=========================================================
    FUNCTIONAL UTILITIES
==========================================================*/
OzoneMenu.prototype.getItem = function (id) {
    return this.menuItems.find(i => String(i.id) === String(id));
};

OzoneMenu.prototype.showLoader = function () {
    if (this.elements.loader) this.elements.loader.classList.remove("hidden");
};

OzoneMenu.prototype.hideLoader = function () {
    if (this.elements.loader) this.elements.loader.classList.add("hidden");
};

/*=========================================================
    STARTUP HANDLER ENGINE
==========================================================*/
OzoneMenu.prototype.start = async function () {
    try {
        this.cacheDOM();
        await this.loadMenu();
        this.restoreLocalData();
        this.ready = true;
        this.attachEvents();
        console.log("OZONE Menu System Active 🍽️ [Multi-Source Data Connected]");
    }
    catch (error) {
        console.error("Critical execution breakdown context initialization failure:", error);
    }
};

/*=========================================================
    LOAD DATA FROM API
==========================================================*/
OzoneMenu.prototype.loadMenu = async function () {
    this.showLoader();
    try {
        const data = await window.OZONE_API.load();

        const sectionItems = [
            ...(data.cafe       || []),
            ...(data.restaurant || []),
            ...(data.bar        || [])
        ];

        // Use section arrays (cafe/restaurant/bar) as primary source.
        // Only fall back to data.menu if sections are empty.
        this.menuItems = sectionItems.length > 0
            ? sectionItems
            : (data.menu || []);

        // Build category list from API categories if available,
        // otherwise derive from item data
        if (data.categories && data.categories.length) {
            this.categories = data.categories
                .sort((a, b) => (a.storyOrder ?? a.displayOrder ?? 0) - (b.storyOrder ?? b.displayOrder ?? 0))
                .map(c => typeof c === "object" ? (c.id || c.name) : c)
                .filter(c => c && c !== "all");   // "all" is added by renderCategoryUI
        } else {
            this.categories = [...new Set(this.menuItems.map(i => i.category))].filter(Boolean);
        }

        this.normalizeData();
        this.filterAndRender();
        this.renderCategoryUI();
        this.hideLoader();

        console.log(`OZONE Menu: ${this.menuItems.length} items, ${this.categories.length} categories`);
    }
    catch (error) {
        this.hideLoader();
        this.showError(error);
    }
};

/*=========================================================
    STRUCTURAL ENVELOPE NORMALIZE TRANSFORMS
==========================================================*/
OzoneMenu.prototype.normalizeData = function () {
    this.menuItems = this.menuItems.map(item => ({
        availability: true,
        featured: item.featured || false,
        badges: [],
        addons: [],
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        dietary: item.dietary || [],
        currency: item.currency || "ETB",
        ...item
    }));
};

/*=========================================================
    RENDER CATEGORY NAVIGATION FILTER INTERFACES
==========================================================*/
OzoneMenu.prototype.renderCategoryUI = function () {
    const container = this.elements.categoryFilter;
    if (!container || container.tagName === "SELECT") return;

    const allLabel = (window.OZONE_I18N && window.OZONE_I18N.t("mp.cat.all")) || "All";
    let html = `<button class="category-card active" data-category="all">${allLabel}</button>`;
    this.categories.forEach(cat => {
        html += this.renderCategoryCard(cat);
    });
    container.innerHTML = html;
};

/*=========================================================
    CORE FILTER ENGINE AND MODAL DATA SORTING MATRIX
==========================================================*/
OzoneMenu.prototype.filterAndRender = function () {
    let items = [...this.menuItems];

    // 1. Process Category Filters
    if (this.filters.category !== "all") {
        items = items.filter(item => item.category === this.filters.category);
    }

    // 2. Process Live Search Input (Engine English & Amharic Lookup Mapping)
    if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        items = items.filter(item => {
            const nameEN = typeof item.name === "object" ? (item.name.en || "").toLowerCase() : (item.name || "").toLowerCase();
            const nameAM = typeof item.name === "object" ? (item.name.am || "").toLowerCase() : "";
            const matchesIngredients = item.ingredients?.some(ing => ing.toLowerCase().includes(q)) || false;

            return nameEN.includes(q) || nameAM.includes(q) || matchesIngredients;
        });
    }

    // 3. Price range
    if (this.filters.price && (this.filters.price.min > 0 || this.filters.price.max < Infinity)) {
        items = items.filter(item => {
            const p = typeof item.price === "object" ? (item.price.medium || item.price.standard || 0) : (item.price || 0);
            return p >= this.filters.price.min && p <= this.filters.price.max;
        });
    }

    // 4. Calorie range
    if (this.filters.calories && (this.filters.calories.min > 0 || this.filters.calories.max < Infinity)) {
        items = items.filter(item => {
            const cal = item.nutrition?.calories ?? item.calories ?? 0;
            return cal >= this.filters.calories.min && cal <= this.filters.calories.max;
        });
    }

    // 5. Availability
    if (this.filters.availability) {
        items = items.filter(item => item.availability !== false);
    }

    // 6. Feature toggles
    if (this.filters.featuredOnly)     items = items.filter(i => i.featured);
    if (this.filters.chefOnly)         items = items.filter(i => i.chefRecommendation);
    if (this.filters.seasonalOnly)     items = items.filter(i => i.seasonal);
    if (this.filters.dailySpecialOnly) items = items.filter(i => i.dailySpecial);

    // 7. Native Sort Strategy Switches
    switch (this.sortBy) {
        case "name":
        case "alphabetical":
            items.sort((a, b) => {
                const nameA = typeof a.name === "object" ? (a.name.en || "") : a.name;
                const nameB = typeof b.name === "object" ? (b.name.en || "") : b.name;
                return nameA.localeCompare(nameB);
            });
            break;
        case "price-low":
            items.sort((a, b) => {
                const priceA = typeof a.price === "object" ? (a.price.medium || a.price.standard) : a.price;
                const priceB = typeof b.price === "object" ? (b.price.medium || b.price.standard) : b.price;
                return priceA - priceB;
            });
            break;
        case "price-high":
            items.sort((a, b) => {
                const priceA = typeof a.price === "object" ? (a.price.medium || a.price.standard) : a.price;
                const priceB = typeof b.price === "object" ? (b.price.medium || b.price.standard) : b.price;
                return priceB - priceA;
            });
            break;
        case "popular":
            items.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
            break;
        default: // "featured"
            items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
    }

    this.filteredItems = items;
    this.renderMenu(this.filteredItems);
};

/*=========================================================
    PRIMARY CORE MENU VIEW COMPILER (STEP 3)
==========================================================*/
OzoneMenu.prototype.renderMenu = function (items) {
    const container = this.elements.menuContainer;
    if (!container) return;

    if (!items.length) {
        container.innerHTML = this.renderEmptyState();
        return;
    }

    container.innerHTML = items
        .map(item => this.renderFoodCard(item, this.language, "ETB"))
        .join("");
};

/*=========================================================
    EVENT BOUND ATTACHMENT DELEGATORS (Fully Wired)
==========================================================*/
OzoneMenu.prototype.attachEvents = function () {
    // 1. Wired Search Inputs
    if (this.elements.searchInput) {
        this.elements.searchInput.addEventListener("input", e => {
            this.filters.search = e.target.value;
            this.filterAndRender();
        });
    }

    // 2. Wired Navigation/Dropdown Category Filters
    if (this.elements.categoryFilter) {
        const handler = e => {
            const target = e.target;
            if (target.tagName === "SELECT") {
                this.filters.category = target.value;
                this.filterAndRender();
            } else {
                const button = target.closest("[data-category]");
                if (!button) return;

                const cards = this.elements.categoryFilter.querySelectorAll("[data-category]");
                cards.forEach(item => item.classList.remove("active"));
                button.classList.add("active");

                this.filters.category = button.dataset.category;
                this.filterAndRender();
            }
        };

        this.elements.categoryFilter.addEventListener("click", handler);
        this.elements.categoryFilter.addEventListener("change", handler);
    }

    // 3. Wired Dropdown Sort Menu Target Change Hooks
    if (this.elements.sortSelect) {
        this.elements.sortSelect.addEventListener("change", e => {
            this.sortBy = e.target.value;
            this.filterAndRender();
        });
    }

    // 4. Delegate Overlay Details Modal Operations & Direct Cart Interceptions
    document.addEventListener("click", e => {
        const card = e.target.closest(".food-card");
        if (!card) return;

        const itemId = card.dataset.id;

        // Add to order via direct action buttons
        if (e.target.closest(".add-to-cart") || e.target.closest(".add-cart")) {
            e.stopPropagation();
            const item = this.getItem(itemId);
            if (item) this.directAddToCart(item);
            return;
        }

        // Open detailed instructions modal on regular background clicks
        if (itemId) {
            this.openFoodModal(itemId);
        }
    });
};

/*=========================================================
    CART DISPATCH INTERCEPT CHANNELS
==========================================================*/
OzoneMenu.prototype.directAddToCart = function (item) {
    const price = typeof item.price === "object" ? (item.price.medium || item.price.standard || Object.values(item.price)[0] || 0) : (item.price || 0);
    const itemPayload = {
        id:       item.id,
        name:     typeof item.name === "object" ? (item.name[this.language] || item.name.en) : item.name,
        image:    item.images?.[0] || item.image || "",
        size:     "standard",
        price:    price,
        quantity: 1,
        addons:   [],
        notes:    ""
    };

    if (typeof OZONE_CART !== "undefined" && OZONE_CART.addItem) {
        OZONE_CART.addItem(itemPayload);
    }
};

/*=========================================================
    OPEN MODAL VIEW SCREEN ROUTINES
==========================================================*/
OzoneMenu.prototype.openFoodModal = function (id) {
    const item = this.getItem(id);
    if (!item) return;

    this.closeFoodModal();
    document.body.insertAdjacentHTML("beforeend", this.renderFoodModal(item, this.language, "ETB"));
    this.bindModalEvents(item);
};

OzoneMenu.prototype.closeFoodModal = function () {
    const modal = document.getElementById("foodModal");
    if (modal) modal.remove();
};

/*=========================================================
    MODAL VIEW INTERACTIVE ELEMENT HANDLERS
==========================================================*/
OzoneMenu.prototype.bindModalEvents = function (item) {
    const modal = document.getElementById("foodModal");
    if (!modal) return;

    modal.querySelector(".modal-close").addEventListener("click",   () => this.closeFoodModal());
    modal.querySelector(".modal-overlay").addEventListener("click", () => this.closeFoodModal());

    // ESC key
    const escHandler = e => { if (e.key === "Escape") { this.closeFoodModal(); document.removeEventListener("keydown", escHandler); } };
    document.addEventListener("keydown", escHandler);

    // Size buttons
    modal.querySelectorAll(".size-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            modal.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const priceEl = modal.querySelector(".modal-price");
            const currency = item.currency || "ETB";
            if (priceEl) priceEl.textContent = `${Number(btn.dataset.price).toLocaleString()} ${currency}`;
        });
    });

    // Quantity
    let qty = 1;
    const qtyEl = modal.querySelector("#modalQty");
    modal.querySelector("#modalQtyMinus")?.addEventListener("click", () => {
        if (qty > 1) { qty--; if (qtyEl) qtyEl.textContent = qty; }
    });
    modal.querySelector("#modalQtyPlus")?.addEventListener("click", () => {
        qty++; if (qtyEl) qtyEl.textContent = qty;
    });

    // Add to cart
    const addButton = modal.querySelector("#modalAddCart");
    if (addButton) {
        addButton.addEventListener("click", () => {
            const selectedSize = modal.querySelector(".size-btn.active");
            const size   = selectedSize?.dataset.size || "standard";
            const defaultPrice = typeof item.price === "object" ? (item.price.medium || item.price.standard || Object.values(item.price)[0] || 0) : (item.price || 0);
            const price  = Number(selectedSize?.dataset.price) || defaultPrice;

            const addons = [];
            modal.querySelectorAll(".addon-item input:checked").forEach(input => {
                const addon = (item.addons || []).find(a => String(a.id) === String(input.value));
                if (addon) addons.push(addon);
            });

            const notes = modal.querySelector("#kitchenNotes")?.value || "";

            if (typeof OZONE_CART !== "undefined" && OZONE_CART.addItem) {
                OZONE_CART.addItem({
                    id:       item.id,
                    name:     typeof item.name === "object" ? (item.name[this.language] || item.name.en) : item.name,
                    image:    item.images?.[0] || item.image || "",
                    size,
                    price,
                    quantity: qty,
                    addons,
                    notes
                });
            }

            this.closeFoodModal();
        });
    }
};

/*=========================================================
    ERROR HANDLING ENGINE DISPLAY
==========================================================*/
OzoneMenu.prototype.showError = function (error) {
    console.error("OZONE Menu Error:", error);
    if (!this.elements.menuContainer) return;
    this.elements.menuContainer.innerHTML = `
        <div class="menu-error" style="grid-column:1/-1;text-align:center;padding:60px;opacity:.85">
            <i class="fas fa-wifi" style="font-size:3rem;color:var(--gold);display:block;margin-bottom:20px"></i>
            <h3 style="margin-bottom:10px">Could not load menu</h3>
            <p style="margin-bottom:20px">Check your connection and try again.</p>
            <button onclick="window.OZONE_API.clearCache();location.reload()"
                    style="padding:12px 28px;border-radius:999px;background:var(--gold);color:#111;font-weight:700;cursor:pointer;border:none">
                Retry
            </button>
        </div>
    `;
};

OzoneMenu.prototype.restoreLocalData = function () {
    const favs = localStorage.getItem("ozone-favorites");
    if (favs) this.favorites = JSON.parse(favs);
};

/*=========================================================
    REFRESH ALIAS (for filters.js compatibility)
==========================================================*/
OzoneMenu.prototype.refresh = function () {
    this.filterAndRender();
};

/*=========================================================
    DOCUMENT BOOTSTRAP INITIALIZER
==========================================================*/
document.addEventListener("DOMContentLoaded", () => {
    window.OZONE_MENU = new OzoneMenu();
    OZONE_MENU.start();
});