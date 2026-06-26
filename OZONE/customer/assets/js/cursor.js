/*=========================================================
    OZONE
    cursor.js — Index.html custom cursor
    Same behaviour as menucursor.js
=========================================================*/

"use strict";

(function () {

    // Hide native cursor
    document.documentElement.style.cursor = "none";

    // Touch devices — skip entirely
    if (window.matchMedia("(hover: none)").matches) {
        document.documentElement.style.cursor = "";
        return;
    }

    const DOT_HALF  = 3;
    const RING_HALF = 20;

    const dot  = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-outline");

    if (!dot || !ring) return;

    let mouseX = -999, mouseY = -999;
    let ringX  = -999, ringY  = -999;

    /*------------------------------------------------------
        TRACKING
    ------------------------------------------------------*/
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px)`;
    });

    /*------------------------------------------------------
        SMOOTH RING FOLLOW
    ------------------------------------------------------*/
    (function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.transform = `translate(${ringX - RING_HALF}px, ${ringY - RING_HALF}px)`;
        requestAnimationFrame(animateRing);
    })();

    /*------------------------------------------------------
        HOVER STATES
    ------------------------------------------------------*/
    document.querySelectorAll("a, button, .card, .btn-primary, .btn-secondary, .signature-card, .preview-card").forEach(el => {
        el.addEventListener("mouseenter", () => {
            ring.classList.add("cursor-grow");
            dot.style.opacity = "0";
        });
        el.addEventListener("mouseleave", () => {
            ring.classList.remove("cursor-grow");
            dot.style.opacity = "1";
        });
    });

    /*------------------------------------------------------
        CLICK RIPPLE
    ------------------------------------------------------*/
    document.addEventListener("click", (e) => {
        const ripple = document.createElement("span");
        ripple.className = "cursor-ripple";
        ripple.style.left = e.clientX + "px";
        ripple.style.top  = e.clientY + "px";
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });

    /*------------------------------------------------------
        CLICK PRESS
    ------------------------------------------------------*/
    document.addEventListener("mousedown", () => ring.classList.add("cursor-click"));
    document.addEventListener("mouseup",   () => ring.classList.remove("cursor-click"));

    /*------------------------------------------------------
        WINDOW LEAVE / ENTER
    ------------------------------------------------------*/
    document.addEventListener("mouseleave", () => {
        dot.style.opacity  = "0";
        ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
        dot.style.opacity  = "1";
        ring.style.opacity = "1";
    });

})();
