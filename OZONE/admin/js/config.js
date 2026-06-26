/*=========================================================
    OZONE Admin — Central Configuration
    ONE place for all constants. Never duplicate these.
=========================================================*/

"use strict";

const OZONE_CONFIG = Object.freeze({

    // Google OAuth Client ID
    CLIENT_ID: "835033311432-enpaq39r3tp4qd7sgsihafejfhs2v3is.apps.googleusercontent.com",

    // Google Apps Script Web App URL (backend)
    API_URL: "https://script.google.com/macros/s/AKfycbzlJ_Gbeungt744hIUwiVwXFqolqsNThVFS6tEIhiLng3_UtpNVSWKykCg_9ZLkhBk/exec",

    // Session settings
    SESSION_KEY:     "ozone_admin_session",   // sessionStorage key
    SESSION_TTL_MS:  8 * 60 * 60 * 1000,     // 8 hours

    // Redirect targets
    LOGIN_PAGE:      "login.html",
    DASHBOARD_PAGE:  "dashboard.html",

    // Role constants
    ROLES: Object.freeze({
        OWNER:   "Owner",
        MANAGER: "Manager",
        STAFF:   "Staff"
    })

});
