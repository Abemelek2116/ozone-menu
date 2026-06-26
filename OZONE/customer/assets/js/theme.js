/*=========================================================
    OZONE
    theme.js

    Theme + Language System

==========================================================*/

"use strict";

class OzoneTheme {

    constructor() {

        this.toggleBtn = document.getElementById("themeToggle");

        this.langBtn = document.getElementById("langToggle");

        this.root = document.documentElement;

        this.currentTheme = localStorage.getItem("ozone-theme") || "dark";

        this.currentLang = localStorage.getItem("ozone-lang") || "en";

    }

    init() {

    this.detectSystemTheme();

    this.applyTheme(this.currentTheme);

    this.events();

    }

}

/*=========================================================
    INIT
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    window.THEME = new OzoneTheme();

    THEME.init();

});
/*=========================================================
    APPLY THEME
==========================================================*/

OzoneTheme.prototype.applyTheme = function (theme) {

    this.currentTheme = theme;

    localStorage.setItem("ozone-theme", theme);

    if (theme === "light") {

        this.root.classList.add("light-theme");

        this.root.classList.remove("dark-theme");

    } else {

        this.root.classList.add("dark-theme");

        this.root.classList.remove("light-theme");

    }

};
/*=========================================================
    APPLY LANGUAGE
==========================================================*/

OzoneTheme.prototype.applyLanguage = function (lang) {

    this.currentLang = lang;

    localStorage.setItem("ozone-lang", lang);

    document.querySelectorAll("[data-en]").forEach(el => {

        el.textContent = lang === "en"
            ? el.dataset.en
            : el.dataset.am;

    });

};
/*=========================================================
    EVENTS
==========================================================*/

OzoneTheme.prototype.events = function () {

    if (this.toggleBtn) {

        this.toggleBtn.addEventListener("click", () => {

            const newTheme =
                this.currentTheme === "dark" ? "light" : "dark";

            this.animateThemeTransition(() => {

                this.applyTheme(newTheme);

            });

        });

    }

    // Language is handled by i18n.js — no duplicate binding here

};
/*=========================================================
    THEME TRANSITION ANIMATION
==========================================================*/

OzoneTheme.prototype.animateThemeTransition = function (callback) {

    const overlay = document.createElement("div");

    overlay.className = "theme-transition";

    document.body.appendChild(overlay);

    gsap.to(overlay, {

        opacity: 1,
        duration: 0.4,
        onComplete: () => {

            callback();

            gsap.to(overlay, {

                opacity: 0,
                duration: 0.4,
                onComplete: () => overlay.remove()

            });

        }

    });

};
/*=========================================================
    SYSTEM PREFERENCE
==========================================================*/

OzoneTheme.prototype.detectSystemTheme = function () {

    const prefersDark =
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (!localStorage.getItem("ozone-theme")) {

        this.applyTheme(prefersDark ? "dark" : "light");

    }

};