/*=========================================================
    OZONE CART ENGINE
    Version 1.0.0
==========================================================*/

"use strict";

class OzoneCart {

    constructor() {

        /*----------------------------------
            Cart Items
        -----------------------------------*/

        this.items = [];



        /*----------------------------------
            Saved For Later
        -----------------------------------*/

        this.saved = [];



        /*----------------------------------
            Pricing
        -----------------------------------*/

        this.taxRate = 0.15;

        this.serviceCharge = 0.10;



        /*----------------------------------
            Currency
        -----------------------------------*/

        this.currency = "Br";



        /*----------------------------------
            Cached Elements
        -----------------------------------*/

        this.elements = {};



        /*----------------------------------
            Ready
        -----------------------------------*/

        this.ready = false;

    }

}
/*=========================================================
    CACHE DOM
==========================================================*/

OzoneCart.prototype.cacheDOM = function () {

    this.elements = {

        cartDrawer:

            document.getElementById("cartDrawer"),

        cartItems:

            document.getElementById("cartItems"),

        cartCount:

            document.getElementById("cartCount"),

        subtotal:

            document.getElementById("cartSubtotal"),

        tax:

            document.getElementById("cartTax"),

        service:

            document.getElementById("cartService"),

        total:

            document.getElementById("cartTotal"),

        checkout:

            document.getElementById("checkoutButton")

    };

};
/*=========================================================
    START
==========================================================*/

OzoneCart.prototype.start = function () {

    this.cacheDOM();

    this.restore();

    this.attachEvents();

    this.render();

    this.ready = true;

};
/*=========================================================
    SAVE
==========================================================*/

OzoneCart.prototype.save = function () {

    localStorage.setItem(

        "ozone-cart",

        JSON.stringify(this.items)

    );

};



/*=========================================================
    RESTORE
==========================================================*/

OzoneCart.prototype.restore = function () {

    const cart =

        localStorage.getItem("ozone-cart");

    if (!cart) return;

    this.items = JSON.parse(cart);

};
/*=========================================================
    ADD ITEM
==========================================================*/

OzoneCart.prototype.addItem = function ({

    id,

    name,

    image,

    size,

    price,

    quantity = 1,

    addons = [],

    notes = ""

}) {

    const existing =

        this.items.find(item =>

            item.id === id &&

            item.size === size &&

            JSON.stringify(item.addons)

            === JSON.stringify(addons)

        );

    if (existing) {

        existing.quantity += quantity;

    }

    else {

        this.items.push({

            id,

            name,

            image,

            size,

            price,

            quantity,

            addons,

            notes

        });

    }

    this.save();

    this.render();

};
/*=========================================================
    REMOVE ITEM
==========================================================*/

OzoneCart.prototype.removeItem = function (index) {

    this.items.splice(index, 1);

    this.save();

    this.render();

};
/*=========================================================
    UPDATE QUANTITY
==========================================================*/

OzoneCart.prototype.updateQuantity = function (

    index,

    quantity

) {

    if (quantity < 1)

        quantity = 1;

    this.items[index].quantity = quantity;

    this.save();

    this.render();

};
/*=========================================================
    SUBTOTAL
==========================================================*/

OzoneCart.prototype.subtotal = function () {

    let total = 0;

    this.items.forEach(item => {

        const addons = item.addons.reduce(

            (sum, addon) =>

                sum + addon.price,

            0

        );

        total +=

            (item.price + addons)

            * item.quantity;

    });

    return total;

};



/*=========================================================
    TAX
==========================================================*/

OzoneCart.prototype.tax = function () {

    return this.subtotal() * this.taxRate;

};



/*=========================================================
    SERVICE
==========================================================*/

OzoneCart.prototype.service = function () {

    return this.subtotal()

        * this.serviceCharge;

};



/*=========================================================
    GRAND TOTAL
==========================================================*/

OzoneCart.prototype.total = function () {

    return this.subtotal()

        + this.tax()

        + this.service();

};
/*=========================================================
    ITEM COUNT
==========================================================*/

OzoneCart.prototype.count = function () {

    return this.items.reduce(

        (sum, item) =>

            sum + item.quantity,

        0

    );

};



/*=========================================================
    FORMAT
==========================================================*/

OzoneCart.prototype.money = function (value) {

    return `${this.currency} ${value.toFixed(2)}`;

};
/*=========================================================
    RENDER CART
==========================================================*/

OzoneCart.prototype.render = function () {

    this.renderItems();

    this.renderTotals();

    if (this.elements.cartCount) {

        this.elements.cartCount.textContent =

            this.count();

    }
};
/*=========================================================
    INITIALIZE
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        window.OZONE_CART =

            new OzoneCart();

        OZONE_CART.start();

    }

);
/*=========================================================
    EMPTY CART
==========================================================*/

OzoneCart.prototype.emptyCartHTML = function () {

    return `

    <div class="cart-empty">

        <div class="cart-empty-icon">

            <i class="fas fa-shopping-bag"></i>

        </div>

        <h2>Your cart is empty</h2>

        <p>

            Discover our signature dishes
            and start your experience.

        </p>

    </div>

    `;

};
/*=========================================================
    CART ITEM
==========================================================*/

OzoneCart.prototype.cartItemHTML = function (item, index) {

    const addons = item.addons
        .map(a => a.name)
        .join(", ");

    return `

<div
    class="cart-item"
    data-index="${index}"
>

    <img
        src="${item.image}"
        alt="${item.name}"
    >

    <div class="cart-details">

        <h3>${item.name}</h3>

        <p>

            Size:

            <strong>${item.size}</strong>

        </p>

        ${addons
            ? `<small>${addons}</small>`
            : ""
        }

        ${item.notes
            ? `
            <div class="cart-note">

                "${item.notes}"

            </div>
            `
            : ""
        }

        <div class="cart-price">

            ${this.money(item.price)}

        </div>

    </div>

    <div class="cart-actions">

        <button
            class="qty-minus"
            data-index="${index}"
        >

            −

        </button>

        <span>

            ${item.quantity}

        </span>

        <button
            class="qty-plus"
            data-index="${index}"
        >

            +

        </button>

        <button
            class="remove-item"
            data-index="${index}"
        >

            <i class="fas fa-trash"></i>

        </button>

    </div>

</div>

`;

};
/*=========================================================
    RENDER ITEMS
==========================================================*/

OzoneCart.prototype.renderItems = function () {

    if (!this.elements.cartItems)
        return;

    if (!this.items.length) {

        this.elements.cartItems.innerHTML =

            this.emptyCartHTML();

        return;

    }

    this.elements.cartItems.innerHTML =

        this.items

            .map((item, index) =>

                this.cartItemHTML(

                    item,

                    index

                )

            )

            .join("");

};
/*=========================================================
    RENDER TOTALS
==========================================================*/

OzoneCart.prototype.renderTotals = function () {

    if (this.elements.subtotal)

        this.elements.subtotal.textContent =

            this.money(this.subtotal());

    if (this.elements.tax)

        this.elements.tax.textContent =

            this.money(this.tax());

    if (this.elements.service)

        this.elements.service.textContent =

            this.money(this.service());

    if (this.elements.total)

        this.elements.total.textContent =

            this.money(this.total());

};
/*=========================================================
    OPEN CART
==========================================================*/

OzoneCart.prototype.open = function () {

    this.elements.cartDrawer

        ?.classList.add("open");

};



/*=========================================================
    CLOSE CART
==========================================================*/

OzoneCart.prototype.close = function () {

    this.elements.cartDrawer

        ?.classList.remove("open");

};



/*=========================================================
    TOGGLE
==========================================================*/

OzoneCart.prototype.toggle = function () {

    this.elements.cartDrawer

        ?.classList.toggle("open");

};
/*=========================================================
    CART EVENTS
==========================================================*/

OzoneCart.prototype.attachEvents = function () {

    document.addEventListener(

        "click",

        e => {

            if (

                e.target.closest(".qty-plus")

            ) {

                const index =

                    Number(

                        e.target.dataset.index

                    );

                this.updateQuantity(

                    index,

                    this.items[index].quantity + 1

                );

            }

            if (

                e.target.closest(".qty-minus")

            ) {

                const index =

                    Number(

                        e.target.dataset.index

                    );

                this.updateQuantity(

                    index,

                    this.items[index].quantity - 1

                );

            }

            if (

                e.target.closest(".remove-item")

            ) {

                const index =

                    Number(

                        e.target.dataset.index

                    );

                this.removeItem(index);

            }

        }

    );

};