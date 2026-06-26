/*=========================================================
    OZONE Admin — Login Page Logic
    Handles Google Identity Services init, credential
    callback, UI states, and redirect on success.
=========================================================*/

"use strict";

// ── UI element references ────────────────────────────────
const ui = {
    status:  document.getElementById("login-status"),
    error:   document.getElementById("login-error"),
    spinner: document.getElementById("login-spinner"),
    btnWrap: document.getElementById("google-btn-container"),

    showLoading(msg) {
        this.spinner.hidden = false;
        this.status.hidden  = false;
        this.status.textContent = msg || "Signing in…";
        this.error.hidden   = true;
        this.btnWrap.style.opacity       = "0.4";
        this.btnWrap.style.pointerEvents = "none";
    },

    showError(msg) {
        this.error.hidden   = false;
        this.error.textContent = msg;
        this.spinner.hidden = true;
        this.status.hidden  = true;
        this.btnWrap.style.opacity       = "1";
        this.btnWrap.style.pointerEvents = "auto";
    },

    showButton() {
        this.spinner.hidden = true;
        this.status.hidden  = true;
        this.error.hidden   = true;
        this.btnWrap.style.opacity       = "1";
        this.btnWrap.style.pointerEvents = "auto";
    }
};

// ── Called by Google after user picks an account ─────────
async function handleGoogleCredential(response) {
    ui.showLoading("Verifying with server…");
    try {
        const { session } = await OzoneAuth.login(response.credential);
        ui.showLoading("Welcome, " + session.name.split(" ")[0] + "! Redirecting…");
        const redirect = sessionStorage.getItem("ozone_redirect_after_login");
        sessionStorage.removeItem("ozone_redirect_after_login");
        setTimeout(() => {
            window.location.replace(redirect || OZONE_CONFIG.DASHBOARD_PAGE);
        }, 800);
    } catch (err) {
        ui.showError(err.message || "Login failed. Please try again.");
    }
}

// ── Initialise GIS and render button ─────────────────────
function initGoogleSignIn() {
    // Verify GIS loaded correctly
    if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
        ui.showError(
            "Google Sign-In could not load. " +
            "Make sure you are on http://localhost:8080 (not file://) " +
            "and that http://localhost:8080 is added as an Authorized JavaScript origin " +
            "in your Google Cloud Console OAuth credentials."
        );
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id:            OZONE_CONFIG.CLIENT_ID,
            callback:             handleGoogleCredential,
            auto_select:          false,
            cancel_on_tap_outside: false
        });

        google.accounts.id.renderButton(
            document.getElementById("google-btn-container"),
            {
                theme:          "filled_black",
                size:           "large",
                shape:          "pill",
                logo_alignment: "left",
                width:          300,
                text:           "continue_with"
            }
        );

        ui.showButton();

    } catch (err) {
        ui.showError("GIS init error: " + err.message);
    }
}

// ── Boot ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    // If already authenticated, skip straight to dashboard
    if (OzoneAuth.getSession()) {
        window.location.replace(OZONE_CONFIG.DASHBOARD_PAGE);
        return;
    }

    // GIS loads synchronously — but guard anyway for slow networks
    if (document.readyState === "complete") {
        initGoogleSignIn();
    } else {
        window.addEventListener("load", initGoogleSignIn);
    }
});
