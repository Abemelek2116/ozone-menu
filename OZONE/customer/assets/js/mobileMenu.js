/*=========================================================
    OZONE
    mobileMenu.js — Shared mobile sidebar (Index + Menu)
=========================================================*/

"use strict";

class OzoneMobileMenu {

    constructor(options = {}) {

        this.mobileMenu = document.getElementById("mobileMenu");
        this.mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");
        this.openMenu = document.getElementById("openMenu");
        this.closeMenu = document.getElementById("closeMenu");
        this.lenis = options.lenis ?? window.OZONE_LENIS ?? null;
        this.navSelector = options.navSelector || ".nav-links a";
        this.scrollOffset = options.scrollOffset ?? -90;

    }

    syncMobileNav() {

        const desktopLinks = document.querySelectorAll(this.navSelector);
        const mobileNav = this.mobileMenu?.querySelector(".mobile-nav-links");

        if(!desktopLinks.length || !mobileNav) return;

        mobileNav.innerHTML = "";

        desktopLinks.forEach(link => {

            const item = document.createElement("a");
            item.href = link.getAttribute("href") || "#";
            if(link.dataset.i18n) item.dataset.i18n = link.dataset.i18n;
            item.textContent = link.textContent.trim();
            mobileNav.appendChild(item);

        });

        window.OZONE_I18N?.apply();

    }

    open() {

        if(!this.mobileMenu || !this.openMenu) return;

        this.mobileMenu.classList.add("active");
        this.mobileMenuBackdrop?.classList.add("active");
        this.openMenu.setAttribute("aria-expanded", "true");
        this.mobileMenu.setAttribute("aria-hidden", "false");
        this.mobileMenuBackdrop?.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");
        document.body.style.overflow = "hidden";
        this.lenis?.stop();

    }

    close() {

        if(!this.mobileMenu || !this.openMenu) return;

        this.mobileMenu.classList.remove("active");
        this.mobileMenuBackdrop?.classList.remove("active");
        this.openMenu.setAttribute("aria-expanded", "false");
        this.mobileMenu.setAttribute("aria-hidden", "true");
        this.mobileMenuBackdrop?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        document.body.style.overflow = "";
        this.lenis?.start();

    }

    handleNavClick(e, link) {

        const href = link.getAttribute("href") || "#";

        this.close();

        if(!href.startsWith("#")) return;

        e.preventDefault();

        if(href === "#" || href === "") {

            if(this.lenis) this.lenis.scrollTo(0);
            else window.scrollTo({ top:0, behavior:"smooth" });

            return;

        }

        const target = document.querySelector(href);

        if(!target) return;

        if(this.lenis) this.lenis.scrollTo(target, { offset:this.scrollOffset });
        else target.scrollIntoView({ behavior:"smooth", block:"start" });

    }

    init() {

        if(!this.openMenu || !this.mobileMenu) return this;

        this.syncMobileNav();

        const mobileNav = this.mobileMenu.querySelector(".mobile-nav-links");

        this.openMenu.addEventListener("click", (e) => {

            e.preventDefault();
            e.stopPropagation();
            this.open();

        });

        this.closeMenu?.addEventListener("click", (e) => {

            e.preventDefault();
            this.close();

        });

        this.mobileMenuBackdrop?.addEventListener("click", () => this.close());

        mobileNav?.addEventListener("click", (e) => {

            const link = e.target.closest("a");

            if(!link || !mobileNav.contains(link)) return;

            this.handleNavClick(e, link);

        });

        document.getElementById("mobileThemeToggle")?.addEventListener("click", () => {

            document.getElementById("themeToggle")?.click();

        });

        document.getElementById("mobileLangToggle")?.addEventListener("click", () => {

            window.OZONE_I18N?.toggle();

        });

        document.addEventListener("keydown", (e) => {

            if(e.key === "Escape" && this.mobileMenu.classList.contains("active")) {

                this.close();

            }

        });

        return this;

    }

}

window.OzoneMobileMenu = OzoneMobileMenu;
