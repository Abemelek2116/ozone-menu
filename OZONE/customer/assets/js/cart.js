/*=========================================================
    OZONE Cart Manager
    Handles cart state, drawer UI, and totals.
    Does NOT load menu data — that belongs to menu.js.
==========================================================*/

"use strict";

class OzoneCart {
    constructor() {
        this.items    = [];
        this.settings = {};
        this.isOpen   = false;
        this.elements = {};
    }
}

/*=========================================================
    INIT
==========================================================*/
OzoneCart.prototype.start = async function () {
    this.cacheDOM();
    await this.loadSettings();
    this.restore();
    this.attachEvents();
    this.render();
    console.log("OZONE Cart Ready 🛒");
};

/*=========================================================
    LOAD SETTINGS (VAT / service charge / currency)
    Pulled from the API — no local file dependency.
==========================================================*/
OzoneCart.prototype.loadSettings = async function () {
    try {
        this.settings = await window.OZONE_API.getSettings();
    } catch (e) {
        // Fallback defaults if API unavailable
        this.settings = {
            tax: { vat: 0.15, serviceCharge: 0.10 },
            application: { currencySymbol: "Br" }
        };
    }
};

/*=========================================================
    CACHE DOM
==========================================================*/
OzoneCart.prototype.cacheDOM = function () {
    this.elements = {
        drawer:       document.getElementById("cartDrawer"),
        openBtn:      document.getElementById("cartButton"),
        closeBtn:     document.getElementById("closeCart"),
        itemsWrap:    document.getElementById("cartItems"),
        countBadge:   document.getElementById("cartCount"),
        subtotalEl:   document.getElementById("cartSubtotal"),
        taxEl:        document.getElementById("cartTax"),
        serviceEl:    document.getElementById("cartService"),
        totalEl:      document.getElementById("cartTotal"),
        checkoutBtn:  document.getElementById("checkoutButton")
    };
};

/*=========================================================
    ATTACH EVENTS
==========================================================*/
OzoneCart.prototype.attachEvents = function () {
    const { openBtn, closeBtn, drawer } = this.elements;

    if (openBtn)  openBtn.addEventListener("click",  () => this.open());
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    // Close on overlay click
    document.addEventListener("click", e => {
        if (this.isOpen && drawer && !drawer.contains(e.target) && !e.target.closest("#cartButton")) {
            this.close();
        }
    });

    // Quantity / remove buttons (delegated)
    if (this.elements.itemsWrap) {
        this.elements.itemsWrap.addEventListener("click", e => {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            const id   = btn.dataset.id;
            const size = btn.dataset.size;
            const action = btn.dataset.action;

            if (action === "inc")    this.changeQty(id, size, 1);
            if (action === "dec")    this.changeQty(id, size, -1);
            if (action === "remove") this.remove(id, size);
        });
    }
};

/*=========================================================
    OPEN / CLOSE
==========================================================*/
OzoneCart.prototype.open = function () {
    this.isOpen = true;
    this.elements.drawer?.classList.add("active");
    // Prevent body scroll while cart is open on mobile
    if (window.innerWidth <= 768) document.body.style.overflow = "hidden";
};

OzoneCart.prototype.close = function () {
    this.isOpen = false;
    this.elements.drawer?.classList.remove("active");
    document.body.style.overflow = "";
};

/*=========================================================
    ADD ITEM
==========================================================*/
OzoneCart.prototype.addItem = function (payload) {
    // payload: { id, name, image, size, price, quantity, addons, notes }
    const key = String(payload.id) + "_" + (payload.size || "standard");
    const existing = this.items.find(i => i._key === key);

    if (existing) {
        existing.quantity += (payload.quantity || 1);
    } else {
        this.items.push({
            _key:     key,
            id:       payload.id,
            name:     payload.name,
            image:    payload.image || "",
            size:     payload.size  || "standard",
            price:    Number(payload.price) || 0,
            quantity: payload.quantity || 1,
            addons:   payload.addons  || [],
            notes:    payload.notes   || ""
        });
    }

    this.save();
    this.render();
    this.open();
    this.animateBadge();
};

/*=========================================================
    CHANGE QUANTITY
==========================================================*/
OzoneCart.prototype.changeQty = function (id, size, delta) {
    const key = String(id) + "_" + size;
    const item = this.items.find(i => i._key === key);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        this.items = this.items.filter(i => i._key !== key);
    }

    this.save();
    this.render();
};

/*=========================================================
    REMOVE
==========================================================*/
OzoneCart.prototype.remove = function (id, size) {
    this.items = this.items.filter(i => i._key !== (String(id) + "_" + size));
    this.save();
    this.render();
};

/*=========================================================
    CLEAR
==========================================================*/
OzoneCart.prototype.clear = function () {
    this.items = [];
    this.save();
    this.render();
};

/*=========================================================
    RENDER
==========================================================*/
OzoneCart.prototype.render = function () {
    this.renderItems();
    this.renderTotals();
    this.renderBadge();
};

OzoneCart.prototype.renderItems = function () {
    const wrap = this.elements.itemsWrap;
    if (!wrap) return;

    if (!this.items.length) {
        const t = key => (window.OZONE_I18N && window.OZONE_I18N.t(key)) || key;
        wrap.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>${t("mp.cart.empty")}</h3>
                <p>${t("mp.cart.empty.p")}</p>
            </div>`;
        return;
    }

    const symbol = this.settings.application?.currencySymbol || "Br";

    wrap.innerHTML = this.items.map(item => `
        <div class="cart-item">
            <img src="../${item.image}" alt="${item.name}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>'">
            <div class="cart-item-info">
                <div>
                    <strong style="font-size:.95rem">${item.name}</strong>
                    <p style="font-size:.8rem;margin-top:2px;text-transform:capitalize">${item.size}</p>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div class="quantity-controls">
                        <button data-action="dec" data-id="${item.id}" data-size="${item.size}">−</button>
                        <span>${item.quantity}</span>
                        <button data-action="inc" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <span style="color:var(--gold);font-weight:600">${symbol} ${(item.price * item.quantity).toLocaleString()}</span>
                    <button data-action="remove" data-id="${item.id}" data-size="${item.size}"
                            style="background:rgba(231,76,60,.15);color:#e74c3c;width:30px;height:30px;border-radius:50%">
                        <i class="fas fa-times" style="pointer-events:none"></i>
                    </button>
                </div>
            </div>
        </div>`).join("");
};

OzoneCart.prototype.renderTotals = function () {
    const symbol    = this.settings.application?.currencySymbol || "Br";
    const vatRate   = this.settings.tax?.vat           ?? 0.15;
    const svcRate   = this.settings.tax?.serviceCharge ?? 0.10;

    const subtotal = this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const vat      = subtotal * vatRate;
    const service  = subtotal * svcRate;
    const total    = subtotal + vat + service;

    const fmt = n => `${symbol} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (this.elements.subtotalEl) this.elements.subtotalEl.textContent = fmt(subtotal);
    if (this.elements.taxEl)      this.elements.taxEl.textContent      = fmt(vat);
    if (this.elements.serviceEl)  this.elements.serviceEl.textContent  = fmt(service);
    if (this.elements.totalEl)    this.elements.totalEl.textContent    = fmt(total);

    // Pass cart to checkout button via sessionStorage
    if (this.elements.checkoutBtn) {
        this.elements.checkoutBtn.classList.toggle("disabled", !this.items.length);
        if (!this.items.length) this.elements.checkoutBtn.style.pointerEvents = "none";
        else                    this.elements.checkoutBtn.style.pointerEvents = "";
    }

    sessionStorage.setItem("ozone-order", JSON.stringify({ items: this.items, subtotal, vat, service, total }));
};

OzoneCart.prototype.renderBadge = function () {
    const badge = this.elements.countBadge;
    if (!badge) return;
    const count = this.items.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count ? "flex" : "none";
};

OzoneCart.prototype.animateBadge = function () {
    const badge = this.elements.countBadge;
    if (!badge) return;
    badge.classList.remove("cart-bounce");
    void badge.offsetWidth;
    badge.classList.add("cart-bounce");
    setTimeout(() => badge.classList.remove("cart-bounce"), 400);
};

/*=========================================================
    PERSIST
==========================================================*/
OzoneCart.prototype.save = function () {
    localStorage.setItem("ozone-cart", JSON.stringify(this.items));
};

OzoneCart.prototype.restore = function () {
    try {
        const saved = localStorage.getItem("ozone-cart");
        if (saved) this.items = JSON.parse(saved);
    } catch (e) {
        this.items = [];
    }
};

/*=========================================================
    GET ITEMS (for external use by order system)
==========================================================*/
OzoneCart.prototype.getItems  = function () { return [...this.items]; };
OzoneCart.prototype.getTotal  = function () {
    const subtotal = this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const vat      = subtotal * (this.settings.tax?.vat           ?? 0.15);
    const service  = subtotal * (this.settings.tax?.serviceCharge ?? 0.10);
    return subtotal + vat + service;
};

/*=========================================================
    BOOTSTRAP
==========================================================*/
document.addEventListener("DOMContentLoaded", () => {
    window.OZONE_CART = new OzoneCart();
    OZONE_CART.start();
});
