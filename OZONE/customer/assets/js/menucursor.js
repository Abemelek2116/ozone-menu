/*==========================================================
    OZONE CURSOR SYSTEM — menu.html
    Matches the Index.html cursor behaviour exactly.
==========================================================*/

"use strict";

(function () {

    // Hide native cursor
    document.documentElement.style.cursor = "none";

    // Create elements
    const dot  = document.createElement("div");
    const ring = document.createElement("div");

    dot.className  = "cursor-dot";
    ring.className = "cursor-ring";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Tracked positions
    let mouseX = -999, mouseY = -999;   // start off-screen so they don't flash
    let ringX  = -999, ringY  = -999;

    // Dot half-sizes for offset calculation
    const DOT_HALF  = 3;    // dot is 6px
    const RING_HALF = 20;   // ring is 40px

    /*------------------------------------------------------
        MOUSE TRACKING
    ------------------------------------------------------*/
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Dot follows instantly
        dot.style.transform = `translate(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px)`;
    });

    /*------------------------------------------------------
        SMOOTH RING ANIMATION
    ------------------------------------------------------*/
    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;

        ring.style.transform = `translate(${ringX - RING_HALF}px, ${ringY - RING_HALF}px)`;

        requestAnimationFrame(animateRing);
    }

    animateRing();

    /*------------------------------------------------------
        HOVER STATES — enlarged ring, hidden dot
    ------------------------------------------------------*/
    function addHoverListeners() {
        document.querySelectorAll("a, button, .food-card, .card-3d, .category-card, .add-to-cart").forEach(el => {
            el.addEventListener("mouseenter", () => {
                ring.classList.add("cursor-hover");
                dot.style.opacity = "0";
            });
            el.addEventListener("mouseleave", () => {
                ring.classList.remove("cursor-hover");
                dot.style.opacity = "1";
            });
        });
    }

    // Run immediately for elements already in the DOM,
    // and again after menu items are rendered
    addHoverListeners();
    window.addEventListener("ozone:menurerendered", addHoverListeners);

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
        CLICK PRESS FEEDBACK
    ------------------------------------------------------*/
    document.addEventListener("mousedown", () => ring.classList.add("cursor-click"));
    document.addEventListener("mouseup",   () => ring.classList.remove("cursor-click"));

    /*------------------------------------------------------
        SHOW / HIDE ON WINDOW LEAVE
    ------------------------------------------------------*/
    document.addEventListener("mouseleave", () => {
        dot.style.opacity  = "0";
        ring.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
        dot.style.opacity  = "1";
        ring.style.opacity = "1";
    });

    /*------------------------------------------------------
        MAGNETIC EFFECT ON PRIMARY BUTTONS
    ------------------------------------------------------*/
    function addMagnetic() {
        document.querySelectorAll(".btn-primary, .add-to-cart").forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width  / 2) * 0.2;
                const y = (e.clientY - r.top  - r.height / 2) * 0.2;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "translate(0, 0)";
            });
        });
    }

    addMagnetic();

    /*------------------------------------------------------
        HIDE ON TOUCH DEVICES
    ------------------------------------------------------*/
    if (window.matchMedia("(hover: none)").matches) {
        dot.style.display  = "none";
        ring.style.display = "none";
        document.documentElement.style.cursor = "";
        return;
    }

    /*------------------------------------------------------
        INJECTED STYLES
    ------------------------------------------------------*/
    const style = document.createElement("style");
    style.textContent = `
        .cursor-dot {
            width: 6px;
            height: 6px;
            background: #D4AF37;
            border-radius: 50%;
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 999999;
            will-change: transform;
            transition: opacity .2s ease;
        }

        .cursor-ring {
            width: 40px;
            height: 40px;
            border: 1.5px solid rgba(212,175,55,.55);
            border-radius: 50%;
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 999998;
            will-change: transform;
            transition: width .25s ease, height .25s ease,
                        border-color .25s ease, opacity .2s ease;
        }

        .cursor-ring.cursor-hover {
            width: 60px;
            height: 60px;
            border-color: #D4AF37;
            margin-left: -10px;
            margin-top: -10px;
        }

        .cursor-ring.cursor-click {
            width: 30px;
            height: 30px;
            margin-left: 5px;
            margin-top: 5px;
        }

        .cursor-ripple {
            position: fixed;
            width: 10px;
            height: 10px;
            background: rgba(212,175,55,.35);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(1);
            animation: cursorRipple .8s ease-out forwards;
            pointer-events: none;
            z-index: 999997;
        }

        @keyframes cursorRipple {
            to {
                transform: translate(-50%, -50%) scale(14);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    console.log("OZONE Cursor Active ✨");

})();
