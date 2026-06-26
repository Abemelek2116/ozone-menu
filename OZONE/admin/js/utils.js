/*=========================================================
    OZONE Admin — Shared Utilities
    Small helper functions used across all admin pages.
=========================================================*/

"use strict";

const OzoneUtils = {

    /*-----------------------------------------------------
        Format currency (ETB)
    -----------------------------------------------------*/
    formatCurrency(amount, symbol = "Br") {
        return `${symbol} ${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    /*-----------------------------------------------------
        Format a JS date to a readable string
    -----------------------------------------------------*/
    formatDate(date) {
        return new Date(date).toLocaleString("en-US", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    },

    /*-----------------------------------------------------
        POST to Apps Script
        Apps Script doesn't support browser CORS POST,
        so we send all mutations as GET with URL params.
    -----------------------------------------------------*/
    async apiPost(params = {}) {
        const url = new URL(OZONE_CONFIG.API_URL);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    },

    /*-----------------------------------------------------
        GET from Apps Script
    -----------------------------------------------------*/
    async apiGet(params = {}) {
        const url = new URL(OZONE_CONFIG.API_URL);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    },

    /*-----------------------------------------------------
        Show a temporary toast notification
    -----------------------------------------------------*/
    toast(message, type = "success") {
        let container = document.getElementById("ozone-toast");
        if (!container) {
            container = document.createElement("div");
            container.id = "ozone-toast";
            container.style.cssText = `
                position:fixed; bottom:30px; right:30px;
                z-index:99999; display:flex; flex-direction:column; gap:10px;
            `;
            document.body.appendChild(container);
        }
        const toast = document.createElement("div");
        toast.style.cssText = `
            padding:14px 22px; border-radius:10px; font-size:.9rem;
            font-family:Inter,sans-serif; font-weight:500;
            box-shadow:0 8px 30px rgba(0,0,0,.4);
            background:${type === "error" ? "#ff4d4d" : type === "warn" ? "#D4AF37" : "#1AA37A"};
            color:${type === "warn" ? "#000" : "#fff"};
            animation:fadeSlideIn .3s ease;
        `;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    /*-----------------------------------------------------
        Sanitise a string to prevent XSS in innerHTML
    -----------------------------------------------------*/
    escape(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

};

// Toast animation keyframes (injected once)
const _toastStyle = document.createElement("style");
_toastStyle.textContent = `@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(_toastStyle);
