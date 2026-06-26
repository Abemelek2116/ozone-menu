/*=========================================================
    OZONE API Service
    Single source of truth for all backend data.
    Fetches from Google Apps Script Web App once,
    caches in memory + localStorage for offline resilience.
==========================================================*/

"use strict";

const OZONE_API = (() => {

    /*-----------------------------------------------------
        CONFIG
    -----------------------------------------------------*/
    const ENDPOINT = "https://script.google.com/macros/s/AKfycbzlJ_Gbeungt744hIUwiVwXFqolqsNThVFS6tEIhiLng3_UtpNVSWKykCg_9ZLkhBk/exec";
    const CACHE_KEY   = "ozone_api_cache";
    const CACHE_TTL   = 5 * 60 * 1000; // 5 minutes
    const MAX_RETRIES = 2;

    /*-----------------------------------------------------
        INTERNAL STATE
    -----------------------------------------------------*/
    let _data     = null;   // in-memory cache
    let _promise  = null;   // in-flight request deduplication

    /*-----------------------------------------------------
        HELPERS
    -----------------------------------------------------*/
    function _readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const { ts, payload } = JSON.parse(raw);
            if (Date.now() - ts < CACHE_TTL) return payload;
        } catch (_) {}
        return null;
    }

    function _writeCache(payload) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }));
        } catch (_) {}
    }

    function _normalize(payload) {
        // Normalize a single item — lowercase category, fix malformed arrays
        function normalizeItem(item) {
            const out = { ...item };
            // Lowercase the category so filtering is consistent
            if (out.category) out.category = String(out.category).toLowerCase();
            // Apps Script serializes Java arrays as "[Ljava.lang.Object;@xxx" — replace with []
            ["ingredients","allergens","dietary","sizes","addons","badges"].forEach(key => {
                if (typeof out[key] === "string" && out[key].startsWith("[L")) out[key] = [];
            });
            // Fix badge: Apps Script serializes objects as "{type=best, text=Best Seller}"
            if (typeof out.badge === "string" && out.badge.startsWith("{")) {
                const typeMatch = out.badge.match(/type=([^,}]+)/);
                const textMatch = out.badge.match(/text=([^,}]+)/);
                out.badge = {
                    type: typeMatch ? typeMatch[1].trim() : "",
                    text: textMatch ? textMatch[1].trim() : ""
                };
            }
            return out;
        }

        const norm = arr => (Array.isArray(arr) ? arr : []).map(normalizeItem);

        // Ensure every expected key exists
        return {
            cafe:       norm(payload.cafe),
            restaurant: norm(payload.restaurant),
            bar:        norm(payload.bar),
            categories: Array.isArray(payload.categories) ? payload.categories : [],
            menu:       norm(payload.menu),
            settings:   _parseSettings(payload.settings)
        };
    }

    // Apps Script sometimes serializes settings as a single-key object with a stringified value
    function _parseSettings(raw) {
        const fallback = { tax: { vat: 0.15, serviceCharge: 0.10 }, application: { currencySymbol: "Br" } };
        if (!raw || typeof raw !== "object") return fallback;

        // Normal case — settings is a proper object with known keys
        if (raw.tax || raw.application) return raw;

        // Malformed case — Apps Script serialized it as { "{key=val,...}": "{key=val,...}" }
        // Extract currency and tax from the key/value strings as best-effort
        const combined = Object.keys(raw).join(" ") + " " + Object.values(raw).join(" ");
        const currencyMatch = combined.match(/currencySymbol=([^\s,}]+)/);
        return {
            tax: { vat: 0.15, serviceCharge: 0.10 },
            application: { currencySymbol: currencyMatch ? currencyMatch[1] : "Br" }
        };
    }

    async function _fetchWithRetry(url, retries) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (err) {
                if (attempt === retries) throw err;
                // Exponential back-off: 500ms, 1000ms
                await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            }
        }
    }

    /*-----------------------------------------------------
        PUBLIC: load()
        Returns the full data object.
        Calls API once; subsequent calls return cached data.
    -----------------------------------------------------*/
    async function load() {
        // Return in-memory cache immediately
        if (_data) return _data;

        // Deduplicate concurrent calls
        if (_promise) return _promise;

        // Try localStorage cache first (works offline / fast reload)
        const cached = _readCache();
        if (cached) {
            _data = cached;
            return _data;
        }

        _promise = (async () => {
            try {
                const raw  = await _fetchWithRetry(ENDPOINT, MAX_RETRIES);
                _data      = _normalize(raw);
                _writeCache(_data);
                console.log("OZONE API: data loaded ✅", {
                    cafe:       _data.cafe.length,
                    restaurant: _data.restaurant.length,
                    bar:        _data.bar.length,
                    categories: _data.categories.length
                });
                return _data;
            } catch (err) {
                console.error("OZONE API: fetch failed ❌", err);
                // Last resort — return empty but valid structure
                _data = _normalize({});
                return _data;
            } finally {
                _promise = null;
            }
        })();

        return _promise;
    }

    /*-----------------------------------------------------
        PUBLIC: clearCache()
        Forces a fresh fetch on next load() call.
        Also call this after deploying API changes.
    -----------------------------------------------------*/
    function clearCache() {
        _data = null;
        _promise = null;
        localStorage.removeItem(CACHE_KEY);
        console.log("OZONE API: cache cleared");
    }

    /*-----------------------------------------------------
        PUBLIC: getSettings()
        Convenience — returns settings without awaiting full load
        if data is already in memory.
    -----------------------------------------------------*/
    async function getSettings() {
        const d = await load();
        return d.settings;
    }

    return { load, clearCache, getSettings };

})();

window.OZONE_API = OZONE_API;
