/*=========================================================
    OZONE Digital Menu Engine
    Version: 1.0.0

    Author: OZONE

    This file controls the complete customer menu.

==========================================================*/

"use strict";

/*=========================================================
    APPLICATION CLASS
==========================================================*/

class OzoneMenu {

    constructor() {

        /* -------------------------------
           JSON Data
        ------------------------------- */

        this.settings = {};

        this.categories = [];

        this.menu = [];



        /* -------------------------------
           Current State
        ------------------------------- */

        this.language = localStorage.getItem("ozone-lang") || "en";

        this.theme = localStorage.getItem("ozone-theme") || "dark";



        /* -------------------------------
           Active Filters
        ------------------------------- */

        this.filters = {

            category: "all",

            search: "",

            price: {

                min: 0,

                max: Infinity

            },

            calories: {

                min: 0,

                max: Infinity

            },

            dietary: [],

            spiceLevel: null,

            availability: true,

            featuredOnly: false,

            chefOnly: false,

            seasonalOnly: false,

            dailySpecialOnly: false

        };



        /* -------------------------------
            Sorting
        ------------------------------- */

        this.sort = {

            by: "featured",

            direction: "asc"

        };



        /* -------------------------------
            Current View
        ------------------------------- */

        this.view = {

            mode: "grid",

            page: 1,

            itemsPerPage: 12

        };



        /* -------------------------------
            Shopping Cart Hook

            (cart.js will control it later)
        ------------------------------- */

        this.cart = [];



        /* -------------------------------
            Favorites
        ------------------------------- */

        this.favorites = [];



        /* -------------------------------
            Cached DOM Elements
        ------------------------------- */

        this.elements = {};



        /* -------------------------------
            Application Ready?
        ------------------------------- */

        this.ready = false;

    }

}
/*=========================================================
    CACHE DOM
==========================================================*/

OzoneMenu.prototype.cacheDOM = function () {

    this.elements = {

        categoryContainer:

            document.getElementById("categoryContainer"),

        featuredContainer:

            document.getElementById("featuredContainer"),

        menuContainer:

            document.getElementById("menuContainer"),

        searchInput:

            document.getElementById("menuSearch"),

        sortSelect:

            document.getElementById("sortMenu"),

        gridButton:

            document.getElementById("gridView"),

        listButton:

            document.getElementById("listView"),

        loader:

            document.getElementById("menuLoader"),

        noResults:

            document.getElementById("noResults"),

        pagination:

            document.getElementById("pagination")

    };

};
/*=========================================================
    UTILITIES
==========================================================*/

OzoneMenu.prototype.getText = function (object) {

    if (!object) return "";

    return object[this.language] || object.en;

};



OzoneMenu.prototype.formatPrice = function (price) {

    const symbol =

        this.settings.restaurant?.currencySymbol ||

        this.settings.application?.currencySymbol ||

        "Br";

    return `${symbol} ${price}`;

};



OzoneMenu.prototype.isAvailable = function (item) {

    return item.availability === true;

};



OzoneMenu.prototype.isFeatured = function (item) {

    return item.featured === true;

};



OzoneMenu.prototype.isChefRecommendation = function (item) {

    return item.chefRecommendation === true;

};



OzoneMenu.prototype.hasDiscount = function (item) {

    return item.discount?.enabled;

};
/*=========================================================
    START APPLICATION
==========================================================*/

OzoneMenu.prototype.start = async function () {

    try {

        this.cacheDOM();

        await this.loadData();

        this.restoreLocalData();

        this.ready = true;

        console.log("OZONE Menu Ready");

    }

    catch (error) {

        console.error(error);

    }

};
/*=========================================================
    RESTORE USER DATA
==========================================================*/

OzoneMenu.prototype.restoreLocalData = function () {

    const favs = localStorage.getItem("ozone-favorites");

    if (favs) {

        this.favorites = JSON.parse(favs);

    }

};
/*=========================================================
    INITIALIZE
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    window.OZONE_MENU = new OzoneMenu();

    OZONE_MENU.start();

});
/*=========================================================
    LOAD JSON FILE
==========================================================*/

OzoneMenu.prototype.loadJSON = async function (url) {

    const response = await fetch(url, {
        cache: "no-store"
    });

    if (!response.ok) {

        throw new Error(`Unable to load ${url}`);

    }

    return await response.json();

};
/*=========================================================
    LOAD APPLICATION DATA
==========================================================*/

OzoneMenu.prototype.loadData = async function () {

    this.showLoader();

    try {

        const [

            settings,

            categories,

            menu

        ] = await Promise.all([

            this.loadJSON("data/settings.json"),

            this.loadJSON("data/categories.json"),

            this.loadJSON("data/menu.json")

        ]);

        this.settings = settings;

        this.categories = categories.categories || [];

        this.menu = menu.menu || [];

        this.normalizeData();

        this.hideLoader();

    }

    catch (error) {

        this.showError(error);

        throw error;

    }

};
/*=========================================================
    NORMALIZE DATA
==========================================================*/

OzoneMenu.prototype.normalizeData = function () {

    this.menu = this.menu.map(item => ({

        availability: true,

        featured: false,

        chefRecommendation: false,

        seasonal: false,

        dailySpecial: false,

        newArrival: false,

        badges: [],

        addons: [],

        ingredients: [],

        allergens: [],

        dietary: [],

        reviewCount: 0,

        rating: 0,

        soldCount: 0,

        images: [],

        ...item

    }));

    this.menu.sort((a, b) => {

        if (a.featured && !b.featured) return -1;

        if (!a.featured && b.featured) return 1;

        return 0;

    });

};
/*=========================================================
    SHOW LOADER
==========================================================*/

OzoneMenu.prototype.showLoader = function () {

    if (!this.elements.loader) return;

    this.elements.loader.classList.remove("hidden");

};



/*=========================================================
    HIDE LOADER
==========================================================*/

OzoneMenu.prototype.hideLoader = function () {

    if (!this.elements.loader) return;

    this.elements.loader.classList.add("hidden");

};
/*=========================================================
    SHOW ERROR
==========================================================*/

OzoneMenu.prototype.showError = function (error) {

    console.error(error);

    if (!this.elements.menuContainer) return;

    this.elements.menuContainer.innerHTML = `

        <div class="menu-error">

            <h2>Oops!</h2>

            <p>Unable to load the menu.</p>

            <button onclick="location.reload()">

                Reload

            </button>

        </div>

    `;

};
/*=========================================================
    GET CATEGORY
==========================================================*/

OzoneMenu.prototype.getCategory = function (id) {

    return this.categories.find(

        category => category.id === id

    );

};



/*=========================================================
    GET ITEM
==========================================================*/

OzoneMenu.prototype.getItem = function (id) {

    return this.menu.find(

        item => item.id === id

    );

};



/*=========================================================
    GET FEATURED
==========================================================*/

OzoneMenu.prototype.getFeaturedItems = function () {

    return this.menu.filter(

        item => item.featured

    );

};



/*=========================================================
    GET DAILY SPECIALS
==========================================================*/

OzoneMenu.prototype.getDailySpecials = function () {

    return this.menu.filter(

        item => item.dailySpecial

    );

};



/*=========================================================
    GET CHEF PICKS
==========================================================*/

OzoneMenu.prototype.getChefRecommendations = function () {

    return this.menu.filter(

        item => item.chefRecommendation

    );

};
/*=========================================================
    START APPLICATION
==========================================================*/

OzoneMenu.prototype.start = async function () {

    try {

        this.cacheDOM();

        await this.loadData();

        this.restoreLocalData();

        this.ready = true;

        this.render();

        this.attachEvents();

        console.log("OZONE Menu Loaded Successfully");

    }

    catch (error) {

        console.error(error);

    }

};
/*=========================================================
    MAIN RENDER
==========================================================*/

OzoneMenu.prototype.render = function () {

    this.renderCategories();

    this.renderFeatured();

    this.renderMenu();

};
/*=========================================================
    RENDER CATEGORY NAVIGATION
==========================================================*/

OzoneMenu.prototype.renderCategories = function () {

    const container = this.elements.categoryContainer;

    if (!container) return;

    let html = "";

    html += `
        <button
            class="category-card active"
            data-category="all">

            All

        </button>
    `;

    this.categories
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach(category => {

            html += Components.categoryCard(
                category,
                this.language
            );

        });

    container.innerHTML = html;

};
/*=========================================================
    FEATURED MENU
==========================================================*/

OzoneMenu.prototype.renderFeatured = function () {

    const container = this.elements.featuredContainer;

    if (!container) return;

    const featured = this.getFeaturedItems();

    if (!featured.length) {

        container.innerHTML = "";

        return;

    }

    const symbol =
        this.settings.application.currencySymbol;

    container.innerHTML = featured
        .slice(0, 6)
        .map(item =>
            Components.foodCard(
                item,
                this.language,
                symbol
            )
        )
        .join("");

};
/*=========================================================
    FILTER ITEMS (ENHANCED VERSION)
==========================================================*/

OzoneMenu.prototype.getFilteredItems = function () {

    let items = [...this.menu];

    // Category
    if (this.filters.category !== "all") {
        items = items.filter(item => item.category === this.filters.category);
    }

    // Search
    if (this.filters.search) {
        const q = this.filters.search.toLowerCase();

        items = items.filter(item => {
            const en = item.name.en.toLowerCase();
            const am = (item.name.am || "").toLowerCase();

            return en.includes(q) || am.includes(q);
        });
    }

    // Price
    items = items.filter(item => {
        const price = item.price.medium;
        return (
            price >= this.filters.price.min &&
            price <= this.filters.price.max
        );
    });

    // Calories
    items = items.filter(item => {
        const calories = item.nutrition.calories;
        return (
            calories >= this.filters.calories.min &&
            calories <= this.filters.calories.max
        );
    });

    // Availability
    if (this.filters.availability) {
        items = items.filter(item => item.availability);
    }

    // Featured
    if (this.filters.featuredOnly) {
        items = items.filter(item => item.featured);
    }

    // Chef Picks
    if (this.filters.chefOnly) {
        items = items.filter(item => item.chefRecommendation);
    }

    // Seasonal
    if (this.filters.seasonalOnly) {
        items = items.filter(item => item.seasonal);
    }

    // Daily Specials
    if (this.filters.dailySpecialOnly) {
        items = items.filter(item => item.dailySpecial);
    }

    // Sorting
    switch (this.sort.by) {

        case "alphabetical":
            items.sort((a, b) =>
                a.name.en.localeCompare(b.name.en)
            );
            break;

        case "price-low":
            items.sort((a, b) =>
                a.price.medium - b.price.medium
            );
            break;

        case "price-high":
            items.sort((a, b) =>
                b.price.medium - a.price.medium
            );
            break;

        case "popular":
            items.sort((a, b) =>
                b.soldCount - a.soldCount
            );
            break;

        default:
            break;
    }

    return items;

};
/*=========================================================
    RENDER MENU
==========================================================*/

OzoneMenu.prototype.renderMenu = function () {

    const container = this.elements.menuContainer;

    if (!container) return;

    const items = this.getFilteredItems();

    if (!items.length) {

        container.innerHTML = Components.emptyState();

        return;

    }

    const symbol =
        this.settings.application.currencySymbol;

    container.innerHTML = items

        .map(item =>

            Components.foodCard(

                item,

                this.language,

                symbol

            )

        )

        .join("");

};
/*=========================================================
    MENU STATISTICS
==========================================================*/

OzoneMenu.prototype.getStatistics = function () {

    return {

        totalItems: this.menu.length,

        featured: this.menu.filter(i => i.featured).length,

        chef:

            this.menu.filter(

                i => i.chefRecommendation

            ).length,

        categories: this.categories.length

    };

};
/*=========================================================
    REFRESH VIEW
==========================================================*/

OzoneMenu.prototype.refresh = function () {

    this.renderMenu();

};
/*=========================================================
    EVENTS
==========================================================*/

OzoneMenu.prototype.attachEvents = function () {

    if (!this.elements.categoryContainer) return;

    this.elements.categoryContainer.addEventListener("click", e => {

        const button = e.target.closest("[data-category]");

        if (!button) return;

        document

            .querySelectorAll("[data-category]")

            .forEach(item =>

                item.classList.remove("active")

            );

        button.classList.add("active");

        this.filters.category =

            button.dataset.category;

        this.refresh();

    });
	
    document.addEventListener("click", e => {

    	const card = e.target.closest(".food-card");

    	if (!card) return;

    	if (e.target.closest(".add-to-cart")) {

        	return;

    	}
	// Safe check to get the ID from data-id attribute
        const itemId = card.dataset.id;
        if (itemId) {

    		this.openFoodModal(card.dataset.id);
		}

	});

};
/*=========================================================
    OPEN FOOD MODAL
==========================================================*/

OzoneMenu.prototype.openFoodModal = function (id) {

    const item = this.getItem(id);

    if (!item) return;

    const symbol =
        this.settings.application.currencySymbol;

    document.body.insertAdjacentHTML(

        "beforeend",

        Components.foodModal(

            item,

            this.language,

            symbol

        )

    );

    this.bindModalEvents(item);

};
/*=========================================================
    CLOSE MODAL
==========================================================*/

OzoneMenu.prototype.closeFoodModal = function () {

    const modal = document.getElementById("foodModal");

    if (modal) {

        modal.remove();

    }

};
/*=========================================================
    MODAL EVENTS
==========================================================*/

OzoneMenu.prototype.bindModalEvents = function (item) {

    const modal = document.getElementById("foodModal");

    if (!modal) return;

    modal

        .querySelector(".modal-close")

        .addEventListener("click",

            () => this.closeFoodModal()

        );

    modal

        .querySelector(".modal-overlay")

        .addEventListener("click",

            () => this.closeFoodModal()

        );

    modal

        .querySelectorAll(".thumbnail")

        .forEach(image => {

            image.addEventListener("click", () => {

                modal.querySelector(

                    "#modalMainImage"

                ).src = image.dataset.image;

            });

        });

    const addButton = modal.querySelector("#modalAddCart");
    if (addButton) {
        addButton.addEventListener("click", () => {
            const selectedSize = modal.querySelector(".size-btn.active");
            const size = selectedSize?.dataset.size || "medium";
            
            // Safe fallback if item.price is a flat number instead of an object
            const defaultPrice = typeof item.price === "object" ? item.price.medium : item.price;
            const price = Number(selectedSize?.dataset.price) || defaultPrice;

            const addons = [];
            modal.querySelectorAll(".addon-item input:checked")
                .forEach(input => {
                    const addon = item.addons.find(
                        a => a.id === input.value
                    );
                    if (addon) {
                        addons.push(addon);
                    }
                });

            const notes = modal.querySelector("#kitchenNotes")?.value || "";

            OZONE_CART.addItem({
                id: item.id,
                name: item.name[this.language] || item.name.en,
                image: item.images[0] || "",
                size,
                price,
                quantity: 1,
                addons,
                notes
            });

            this.closeFoodModal();
        });
    }

};