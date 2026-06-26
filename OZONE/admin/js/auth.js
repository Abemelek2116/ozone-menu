/*=========================================================
    OZONE Admin — Authentication Core
    Handles: login, logout, session save/restore,
             session validation, role helpers.
    Used by every admin page.
=========================================================*/

"use strict";

const OzoneAuth = (() => {

    /*-----------------------------------------------------
        INTERNAL: read session from sessionStorage
    -----------------------------------------------------*/
    function _readSession() {
        try {
            const raw = sessionStorage.getItem(OZONE_CONFIG.SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);

            // Check expiry
            if (Date.now() > session.expiresAt) {
                sessionStorage.removeItem(OZONE_CONFIG.SESSION_KEY);
                return null;
            }
            return session;
        } catch (_) {
            return null;
        }
    }

    /*-----------------------------------------------------
        INTERNAL: write session to sessionStorage
    -----------------------------------------------------*/
    function _writeSession(data) {
        const session = {
            email:     data.email,
            name:      data.name,
            picture:   data.picture,
            role:      data.role,
            expiresAt: Date.now() + OZONE_CONFIG.SESSION_TTL_MS
        };
        sessionStorage.setItem(OZONE_CONFIG.SESSION_KEY, JSON.stringify(session));
        return session;
    }

    /*-----------------------------------------------------
        PUBLIC: login(credential)
        Sends Google JWT to Apps Script.
        Uses POST with no-cors since JWT is too long for GET URL.
        Apps Script accepts POST body via e.postData.
    -----------------------------------------------------*/
    async function login(credential) {
        // JWTs are ~900 chars — too long for a GET URL safely.
        // We POST as JSON and read via e.postData in Apps Script.
        const res = await fetch(OZONE_CONFIG.API_URL, {
            method:  "POST",
            headers: { "Content-Type": "text/plain" },  // text/plain avoids CORS preflight
            body:    JSON.stringify({ action: "login", credential })
        });
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Access denied.");
        const session = _writeSession(data);
        return { success: true, session };
    }

    /*-----------------------------------------------------
        PUBLIC: getSession()
        Returns current valid session or null.
    -----------------------------------------------------*/
    function getSession() {
        return _readSession();
    }

    /*-----------------------------------------------------
        PUBLIC: requireAuth()
        Call at top of every protected page.
        Redirects to login if not authenticated.
        Returns the valid session.
    -----------------------------------------------------*/
    function requireAuth() {
        const session = _readSession();
        if (!session) {
            // Preserve the page the user was trying to visit
            sessionStorage.setItem("ozone_redirect_after_login", window.location.href);
            window.location.replace(OZONE_CONFIG.LOGIN_PAGE);
            return null;
        }
        return session;
    }

    /*-----------------------------------------------------
        PUBLIC: logout()
        Clears session, redirects to login.
    -----------------------------------------------------*/
    async function logout() {
        // Best-effort server-side logout notification via GET
        try {
            const url = new URL(OZONE_CONFIG.API_URL);
            url.searchParams.set("action", "logout");
            await fetch(url.toString());
        } catch (_) { /* ignore — local cleanup always happens */ }

        // Revoke Google token if GIS is loaded
        const session = _readSession();
        if (session && window.google?.accounts?.id) {
            google.accounts.id.revoke(session.email, () => {});
        }

        sessionStorage.removeItem(OZONE_CONFIG.SESSION_KEY);
        window.location.replace(OZONE_CONFIG.LOGIN_PAGE);
    }

    /*-----------------------------------------------------
        PUBLIC: Role helpers
        Use these instead of comparing role strings directly.
    -----------------------------------------------------*/
    function isOwner(session)   { return session?.role === OZONE_CONFIG.ROLES.OWNER; }
    function isManager(session) { return session?.role === OZONE_CONFIG.ROLES.MANAGER ||
                                         isOwner(session); }
    function isStaff(session)   { return !!session?.role; } // any authenticated role

    /*-----------------------------------------------------
        PUBLIC: populateSidebar(session)
        Injects the user's name/picture into the sidebar
        and wires the logout button — call after requireAuth().
    -----------------------------------------------------*/
    function populateSidebar(session) {
        const nameEl    = document.getElementById("admin-name");
        const pictureEl = document.getElementById("admin-picture");
        const roleEl    = document.getElementById("admin-role");
        const logoutBtn = document.getElementById("logout-btn");

        if (nameEl)    nameEl.textContent   = session.name || session.email;
        if (roleEl)    roleEl.textContent   = session.role || "";
        if (pictureEl && session.picture) {
            pictureEl.src = session.picture;
            pictureEl.alt = session.name;
        }
        if (logoutBtn) logoutBtn.addEventListener("click", logout);
    }

    // Expose public API
    return { login, getSession, requireAuth, logout,
             isOwner, isManager, isStaff, populateSidebar };

})();
