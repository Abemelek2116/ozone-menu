/*=========================================================
    OZONE Checkout Page
=========================================================*/

"use strict";

class OzoneCheckout {

    constructor() {
        this.order      = null;
        this.payments   = null;
        this.selectedId = null;
        this.symbol     = "Br";
    }

    assetUrl(path) {
        if (!path) return "";
        if (/^(https?:|\/|data:)/.test(path)) return path;
        return `../${path}`;
    }

    t(key) {
        return (window.OZONE_I18N && window.OZONE_I18N.t(key)) || key;
    }

    fmt(amount) {
        return `${this.symbol} ${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    toast(message, type = "success") {
        const el = document.getElementById("checkoutToast");
        if (!el) return;
        el.textContent = message;
        el.className = `checkout-toast show ${type}`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
    }

    loadOrder() {
        try {
            const raw = sessionStorage.getItem("ozone-order");
            this.order = raw ? JSON.parse(raw) : null;
        } catch (_) {
            this.order = null;
        }

        if (!this.order?.items?.length) {
            window.location.replace("menu.html");
            return false;
        }

        return true;
    }

    async loadPayments() {
        const base = new URL("../assets/data/", window.location.href);
        const res  = await fetch(new URL("payments.json", base));

        if (!res.ok) throw new Error("Could not load payment methods");

        this.payments = await res.json();
    }

    renderSummary() {
        const { items, subtotal, vat, service, total } = this.order;
        const list = document.getElementById("orderItemsList");

        if (list) {
            list.innerHTML = items.map(item => `
                <li class="order-item-row">
                    <div>
                        <strong>${item.name}</strong>
                        <small>${item.quantity}× · ${item.size}</small>
                    </div>
                    <span>${this.fmt(item.price * item.quantity)}</span>
                </li>
            `).join("");
        }

        document.getElementById("summarySubtotal").textContent = this.fmt(subtotal);
        document.getElementById("summaryVat").textContent      = this.fmt(vat);
        document.getElementById("summaryService").textContent  = this.fmt(service);
        document.getElementById("summaryTotal").textContent    = this.fmt(total);
        document.getElementById("amountDueValue").textContent  = this.fmt(total);
    }

    qrSrc(bank) {
        if (bank.qrImage) return this.assetUrl(bank.qrImage);

        const payload = [
            bank.shortName,
            bank.accountName,
            bank.accountNumber,
            `Amount: ${this.order.total} ETB`
        ].join(" | ");

        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(payload)}`;
    }

    renderBanks() {
        const grid = document.getElementById("bankGrid");
        if (!grid || !this.payments?.banks) return;

        grid.innerHTML = this.payments.banks.map((bank, index) => `
            <button
                type="button"
                class="bank-card card-3d${index === 0 ? " active" : ""}"
                data-bank-id="${bank.id}"
                role="tab"
                aria-selected="${index === 0}"
                style="--bank-color:${bank.brandColor}">
                <div class="bank-card-icon"><i class="fas ${bank.icon}"></i></div>
                <div class="bank-card-text">
                    <strong>${bank.shortName}</strong>
                    <span>${bank.type === "mobile" ? "Mobile Wallet" : "Bank Transfer"}</span>
                </div>
                <div class="bank-card-shine"></div>
            </button>
        `).join("");

        this.selectedId = this.payments.banks[0]?.id || null;
        if (this.selectedId) this.showBank(this.selectedId);

        grid.addEventListener("click", e => {
            const card = e.target.closest("[data-bank-id]");
            if (!card) return;

            grid.querySelectorAll(".bank-card").forEach(c => {
                c.classList.remove("active");
                c.setAttribute("aria-selected", "false");
            });

            card.classList.add("active");
            card.setAttribute("aria-selected", "true");
            this.showBank(card.dataset.bankId);
        });
    }

    showBank(id) {
        const bank = this.payments.banks.find(b => b.id === id);
        if (!bank) return;

        this.selectedId = id;
        const panel = document.getElementById("paymentDetail");

        document.getElementById("selectedBankName").textContent = bank.name;
        document.getElementById("selectedBankType").textContent =
            bank.type === "mobile" ? this.t("co.type.mobile") : this.t("co.type.bank");

        const badge = document.getElementById("selectedBankBadge");
        badge.innerHTML = `<i class="fas ${bank.icon}"></i>`;
        badge.style.background = bank.brandColor;

        document.getElementById("accountNameValue").textContent   = bank.accountName;
        document.getElementById("accountNumberValue").textContent  = bank.accountNumber;
        document.getElementById("qrImage").src = this.qrSrc(bank);
        document.getElementById("qrImage").alt = `${bank.name} QR code`;

        panel?.classList.add("is-visible");

        if (window.gsap) {
            gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
        }
    }

    bindCopyButtons() {
        document.querySelectorAll(".copy-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const targetId = btn.dataset.copyTarget;
                const el       = document.getElementById(targetId);
                if (!el) return;

                const text = el.textContent.trim();

                try {
                    await navigator.clipboard.writeText(text);
                    btn.classList.add("copied");
                    this.toast(this.t("co.copied"), "success");
                    setTimeout(() => btn.classList.remove("copied"), 1500);
                } catch (_) {
                    this.toast(this.t("co.copy.fail"), "error");
                }
            });
        });
    }

    bindUpload() {
        const input  = document.getElementById("receiptUpload");
        const area   = document.getElementById("uploadArea");
        const preview = document.getElementById("receiptPreview");
        const confirm = document.getElementById("confirmPaymentBtn");

        if (!input || !area) return;

        const handleFile = file => {
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                this.toast(this.t("co.receipt.large"), "error");
                return;
            }

            preview.classList.add("is-visible");
            preview.innerHTML = `<i class="fas fa-file-image"></i> ${file.name}`;
            confirm.disabled = false;
        };

        area.addEventListener("click", () => input.click());
        area.addEventListener("dragover", e => { e.preventDefault(); area.classList.add("dragover"); });
        area.addEventListener("dragleave", () => area.classList.remove("dragover"));
        area.addEventListener("drop", e => {
            e.preventDefault();
            area.classList.remove("dragover");
            handleFile(e.dataTransfer.files[0]);
        });

        input.addEventListener("change", () => handleFile(input.files[0]));

        confirm?.addEventListener("click", () => {
            localStorage.removeItem("ozone-cart");
            sessionStorage.removeItem("ozone-order");
            document.getElementById("successModal")?.classList.add("is-visible");
        });
    }

    initAnimations() {
        if (typeof gsap === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray(".fade-up, .fade-right, .fade-left, .zoom-in").forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: "top 88%", toggleClass: "active" }
            });
        });

        gsap.utils.toArray(".parallax-slow").forEach(el => {
            gsap.to(el, {
                y: -60,
                scrollTrigger: { trigger: ".checkout-body", scrub: true }
            });
        });

        gsap.utils.toArray(".parallax-medium").forEach(el => {
            gsap.to(el, {
                y: -120,
                scrollTrigger: { trigger: ".checkout-body", scrub: true }
            });
        });

        document.querySelectorAll(".card-3d").forEach(card => {
            card.addEventListener("mousemove", e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });

        gsap.from(".checkout-hero-content", {
            y: 40, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.2
        });
    }

    initScrollProgress() {
        const bar = document.querySelector(".scroll-progress");
        if (!bar) return;

        window.addEventListener("scroll", () => {
            const doc  = document.documentElement.scrollHeight - window.innerHeight;
            const pct  = doc > 0 ? (window.scrollY / doc) * 100 : 0;
            bar.style.width = `${pct}%`;
        });
    }

    initLenis() {
        if (typeof Lenis === "undefined") return;

        const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        window.OZONE_LENIS = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }

    applyInstructions() {
        const lang = localStorage.getItem("ozone-lang") || "en";
        const el   = document.getElementById("paymentInstructions");

        if (el && this.payments?.instructions) {
            el.textContent = this.payments.instructions[lang] || this.payments.instructions.en;
        }
    }

    async start() {
        if (!this.loadOrder()) return;

        try {
            await this.loadPayments();
        } catch (err) {
            console.error(err);
            this.toast(this.t("co.error.payments"), "error");
            return;
        }

        this.symbol = this.payments.currency === "ETB" ? "Br" : (this.payments.currency || "Br");

        this.renderSummary();
        this.renderBanks();
        this.bindCopyButtons();
        this.bindUpload();
        this.applyInstructions();
        this.initScrollProgress();
        this.initLenis();
        this.initAnimations();

        if (typeof OzoneMobileMenu !== "undefined") {
            new OzoneMobileMenu({ lenis: window.OZONE_LENIS }).init();
        }

        window.addEventListener("ozone:langchange", () => this.applyInstructions());
    }

}

document.addEventListener("DOMContentLoaded", () => {
    window.OZONE_CHECKOUT = new OzoneCheckout();
    OZONE_CHECKOUT.start();
});
