/*=========================================================
    OZONE UI COMPONENT LIBRARY
    Version: 1.0.0

    This file contains all reusable UI components
    used throughout the customer application.

==========================================================*/

"use strict";

const Components = {

    /*=========================================
        Escape HTML
    =========================================*/

    escape(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    },

    /*=========================================
        Format Price
    =========================================*/

    formatPrice(price, symbol = "Br") {

        return `${symbol} ${Number(price).toLocaleString()}`;

    }

};
/*=========================================================
    RATING STARS
==========================================================*/

Components.ratingStars = function (rating = 0) {

    let html = "";

    const fullStars = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {

        if (i <= fullStars) {

            html += `<i class="fas fa-star"></i>`;

        } else {

            html += `<i class="far fa-star"></i>`;

        }

    }

    return `

        <div class="food-rating">

            ${html}

            <span>${rating.toFixed(1)}</span>

        </div>

    `;

};
/*=========================================================
    BADGES
==========================================================*/

Components.badges = function (item) {

    let html = "";

    if (item.featured)
        html += `<span class="badge badge-featured">Featured</span>`;

    if (item.chefRecommendation)
        html += `<span class="badge badge-chef">Chef Pick</span>`;

    if (item.newArrival)
        html += `<span class="badge badge-new">New</span>`;

    if (item.dailySpecial)
        html += `<span class="badge badge-special">Today's Special</span>`;

    if (Array.isArray(item.badges)) {

        item.badges.forEach(badge => {

            html += `<span class="badge">${this.escape(badge)}</span>`;

        });

    }

    return html;

};
/*=========================================================
    PRICE DISPLAY
==========================================================*/

Components.price = function (item, symbol = "Br") {

    const price = item.price.medium;

    if (!item.discount?.enabled) {

        return `

            <div class="food-price">

                ${this.formatPrice(price, symbol)}

            </div>

        `;

    }

    return `

        <div class="food-price">

            <span class="old-price">

                ${this.formatPrice(price, symbol)}

            </span>

            <span class="new-price">

                ${this.formatPrice(
                    item.discount.discountPrice.medium,
                    symbol
                )}

            </span>

        </div>

    `;

};
/*=========================================================
    FOOD CARD
==========================================================*/

Components.foodCard = function (item, language = "en", symbol = "Br") {

    const image = item.images.length
        ? item.images[0]
        : "assets/images/foods/default-food.jpg";

    const name =
        item.name[language] || item.name.en;

    const description =
        item.shortDescription[language] ||
        item.shortDescription.en;

    return `

<div class="food-card card-3d" data-id="${item.id}">

    <div class="food-image">

        <img src="${image}" alt="${this.escape(name)}">

        <div class="food-badges">

            ${this.badges(item)}

        </div>

    </div>

    <div class="food-body">

        <h3>${this.escape(name)}</h3>

        <p>${this.escape(description)}</p>

        ${this.ratingStars(item.rating)}

        <div class="food-meta">

            <span>

                🔥 ${item.nutrition.calories} kcal

            </span>

            <span>

                ⏱ ${item.preparationTime} min

            </span>

        </div>

        ${this.price(item, symbol)}

        <button
            class="btn-primary add-to-cart"
            data-id="${item.id}"
        >

            Add to Cart

        </button>

    </div>

</div>

`;

};
/*=========================================================
    CATEGORY CARD
==========================================================*/

Components.categoryCard = function (category, language = "en") {

    const name =
        category.name[language] || category.name.en;

    return `

<div
    class="category-card"
    data-category="${category.id}"
>

    <div
        class="category-icon"
        style="background:${category.color}"
    >

        <i class="fas ${category.icon}"></i>

    </div>

    <h4>${this.escape(name)}</h4>

</div>

`;

};
/*=========================================================
    EMPTY RESULTS
==========================================================*/

Components.emptyState = function () {

    return `

<div class="empty-state">

    <img
        src="assets/images/empty.svg"
        alt="No Results"
    >

    <h2>No Menu Items Found</h2>

    <p>

        Try changing your search or filters.

    </p>

</div>

`;

};
/*=========================================================
    LOADING SKELETON
==========================================================*/

Components.loadingCards = function (count = 8) {

    let html = "";

    for (let i = 0; i < count; i++) {

        html += `

<div class="food-card skeleton">

    <div class="skeleton-image"></div>

    <div class="skeleton-line"></div>

    <div class="skeleton-line short"></div>

</div>

`;

    }

    return html;

};
/*=========================================================
    GLOBAL EXPORT
==========================================================*/

window.Components = Components;
/*=========================================================
    FOOD DETAIL MODAL
==========================================================*/

Components.foodModal = function (
    item,
    language = "en",
    symbol = "Br"
) {

    const name =
        item.name[language] || item.name.en;

    const description =
        item.description[language] ||
        item.description.en;

    const images = item.images.length
        ? item.images
        : ["assets/images/foods/default-food.jpg"];

    const addons = item.addons || [];

    return `

<div class="ozone-modal" id="foodModal">

    <div class="modal-overlay"></div>

    <div class="modal-container">

        <button class="modal-close">

            &times;

        </button>

        <div class="modal-gallery">

            <div class="main-image">

                <img
                    id="modalMainImage"
                    src="${images[0]}"
                    alt="${this.escape(name)}"
                >

            </div>

            <div class="thumbnail-row">

                ${images.map(img => `

                    <img
                        class="thumbnail"
                        src="${img}"
                        data-image="${img}"
                    >

                `).join("")}

            </div>

        </div>

        <div class="modal-info">

            <h2>${this.escape(name)}</h2>

            ${this.ratingStars(item.rating)}

            <p>

                ${this.escape(description)}

            </p>

            ${this.price(item, symbol)}

            <div class="nutrition-grid">

                <div>

                    <strong>${item.nutrition.calories}</strong>

                    <span>Calories</span>

                </div>

                <div>

                    <strong>${item.preparationTime}</strong>

                    <span>Minutes</span>

                </div>

                <div>

                    <strong>${item.portionSize}</strong>

                    <span>Portion</span>

                </div>

            </div>

            <h3>Choose Size</h3>

            <div class="size-options">

                ${Object.entries(item.price).map(([size, price]) => `

                    <button
                        class="size-btn"
                        data-size="${size}"
                        data-price="${price}"
                    >

                        ${size.toUpperCase()}

                        <span>

                            ${this.formatPrice(price, symbol)}

                        </span>

                    </button>

                `).join("")}

            </div>

            <h3>Add-ons</h3>

            <div class="addon-list">

                ${addons.map(addon => `

                    <label class="addon-item">

                        <input
                            type="checkbox"
                            value="${addon.id}"
                        >

                        <span>

                            ${this.escape(addon.name)}

                        </span>

                        <strong>

                            +${this.formatPrice(addon.price, symbol)}

                        </strong>

                    </label>

                `).join("")}

            </div>

            <h3>Special Instructions</h3>

            <textarea
                id="kitchenNotes"
                placeholder="Kitchen notes..."
            ></textarea>

            <div class="modal-footer">

                <div class="quantity-selector">

                    <button class="qty-minus">−</button>

                    <span id="modalQty">1</span>

                    <button class="qty-plus">+</button>

                </div>

                <button
                    class="btn-primary"
                    id="modalAddCart"
                    data-id="${item.id}"
                >

                    Add To Cart

                </button>

            </div>

        </div>

    </div>

</div>

`;

};