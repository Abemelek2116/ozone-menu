/*=========================================================
    OZONE API Service
    Loads menu data from Google Apps Script when available,
    otherwise falls back to bundled JSON in assets/data/.
=========================================================*/

"use strict";

const OZONE_API = (() => {

    const ENDPOINT  = "https://script.google.com/macros/s/AKfycbzlJ_Gbeungt744hIUwiVwXFqolqsNThVFS6tEIhiLng3_UtpNVSWKykCg_9ZLkhBk/exec";
    const CACHE_KEY = "ozone_api_cache";
    const CACHE_TTL = 5 * 60 * 1000;
    const MAX_RETRIES = 2;

    const _LOCAL_DATA_BASE = (() => {
        const script = document.currentScript;
        if (script?.src) {
            return new URL("../data/", script.src).href;
        }
        if (window.location.pathname.includes("/pages/")) {
            return new URL("../assets/data/", window.location.href).href;
        }
        return new URL("assets/data/", window.location.href).href;
    })();

    let _data    = null;
    let _promise = null;

    function _hasItems(payload) {
        if (!payload) return false;
        return (
            (payload.cafe?.length       || 0) +
            (payload.restaurant?.length || 0) +
            (payload.bar?.length        || 0) +
            (payload.menu?.length       || 0)
        ) > 0;
    }

    function _readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const { ts, payload } = JSON.parse(raw);
            if (Date.now() - ts < CACHE_TTL && _hasItems(payload)) return payload;
        } catch (_) {}
        return null;
    }

    function _writeCache(payload) {
        if (!_hasItems(payload)) return;
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }));
        } catch (_) {}
    }

    function _normalize(payload) {
        function normalizeItem(item) {
            const out = { ...item };

            if (out.category) out.category = String(out.category).toLowerCase();

            if (out.available !== undefined && out.availability === undefined) {
                out.availability = out.available !== false;
            }

            ["ingredients","allergens","dietary","sizes","addons","badges"].forEach(key => {
                if (typeof out[key] === "string" && out[key].startsWith("[L")) out[key] = [];
            });

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

        return {
            cafe:       norm(payload.cafe),
            restaurant: norm(payload.restaurant),
            bar:        norm(payload.bar),
            categories: Array.isArray(payload.categories) ? payload.categories : [],
            menu:       norm(payload.menu),
            settings:   _parseSettings(payload.settings)
        };
    }

    function _parseSettings(raw) {
        const fallback = {
            tax: { vat: 0.15, serviceCharge: 0.10 },
            application: { currencySymbol: "Br" }
        };

        if (!raw || typeof raw !== "object") return fallback;
        if (raw.tax || raw.application) return raw;

        const combined = Object.keys(raw).join(" ") + " " + Object.values(raw).join(" ");
        const currencyMatch = combined.match(/currencySymbol=([^\s,}]+)/);

        return {
            tax: { vat: 0.15, serviceCharge: 0.10 },
            application: { currencySymbol: currencyMatch ? currencyMatch[1] : "Br" }
        };
    }

    function _apiUrl(params = {}) {
        const url = new URL(ENDPOINT);
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        return url.toString();
    }

    async function _fetchWithRetry(url, retries = MAX_RETRIES) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (err) {
                if (attempt === retries) throw err;
                await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            }
        }
    }

    async function _fetchLocalJson(filename) {
        const res = await fetch(new URL(filename, _LOCAL_DATA_BASE));
        if (!res.ok) throw new Error(`Failed to load ${filename} (${res.status})`);
        return res.json();
    }

    function _extractItems(raw) {
        if (Array.isArray(raw)) return raw;
        if (raw?.success === false) return [];
        return raw?.items || raw?.data || [];
    }

    async function _loadLocalMenu() {
        const [cafe, restaurant, bar, categories] = await Promise.all([
            _fetchLocalJson("cafe.json"),
            _fetchLocalJson("restaurant.json"),
            _fetchLocalJson("bar.json"),
            _fetchLocalJson("categories.json")
        ]);

        return {
            cafe,
            restaurant,
            bar,
            categories,
            menu: [],
            settings: {}
        };
    }

    async function _loadFromGoogle() {
        const [cafeRaw, restaurantRaw, barRaw, categoriesRaw, settingsRaw] = await Promise.all([
            _fetchWithRetry(_apiUrl({ action: "getSheetItems", sheet: "Cafe" })),
            _fetchWithRetry(_apiUrl({ action: "getSheetItems", sheet: "Restaurant" })),
            _fetchWithRetry(_apiUrl({ action: "getSheetItems", sheet: "Bar" })),
            _fetchWithRetry(_apiUrl({ action: "getCategories" })).catch(() => []),
            _fetchWithRetry(_apiUrl({ action: "getSettings" })).catch(() => ({}))
        ]);

        return {
            cafe:       _extractItems(cafeRaw),
            restaurant: _extractItems(restaurantRaw),
            bar:        _extractItems(barRaw),
            categories: Array.isArray(categoriesRaw)
                ? categoriesRaw
                : (categoriesRaw?.categories || categoriesRaw?.items || []),
            menu:       [],
            settings:   settingsRaw || {}
        };
    }

    async function _resolveMenuData() {
        try {
            const remote = await _loadFromGoogle();
            if (_hasItems(remote)) {
                console.log("OZONE API: loaded from Google Sheets ✅");
                return _normalize(remote);
            }
            console.warn("OZONE API: Google response empty — using local menu JSON");
        } catch (err) {
            console.warn("OZONE API: Google fetch failed — using local menu JSON", err);
        }

        const local = await _loadLocalMenu();
        return _normalize(local);
    }

    async function load() {
        if (_data) return _data;
        if (_promise) return _promise;

        const cached = _readCache();
        if (cached) {
            _data = cached;
            return _data;
        }

        _promise = (async () => {
            try {
                _data = await _resolveMenuData();
                _writeCache(_data);
                console.log("OZONE API: menu ready ✅", {
                    cafe:       _data.cafe.length,
                    restaurant: _data.restaurant.length,
                    bar:        _data.bar.length,
                    categories: _data.categories.length
                });
                return _data;
            } catch (err) {
                console.error("OZONE API: all sources failed ❌", err);
                _data = _normalize({});
                return _data;
            } finally {
                _promise = null;
            }
        })();

        return _promise;
    }

    function clearCache() {
        _data = null;
        _promise = null;
        localStorage.removeItem(CACHE_KEY);
        console.log("OZONE API: cache cleared");
    }

    async function getSettings() {
        const d = await load();
        return d.settings;
    }

    return { load, clearCache, getSettings };

})();

window.OZONE_API = OZONE_API;
