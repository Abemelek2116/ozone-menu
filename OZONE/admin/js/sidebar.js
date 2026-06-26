/*=========================================================
    OZONE Admin — Sidebar Renderer
    Injects the sidebar HTML into every admin page.
    Call renderSidebar(activePageId) after DOMContentLoaded.
=========================================================*/

"use strict";

function renderSidebar(activePage) {

    const nav = [
        { id: "dashboard",  href: "dashboard.html",  icon: "fa-gauge",        label: "Dashboard"  },
        { id: "foods",      href: "foods.html",       icon: "fa-utensils",     label: "Foods"      },
        { id: "categories", href: "categories.html",  icon: "fa-layer-group",  label: "Categories" },
        { id: "orders",     href: "orders.html",      icon: "fa-receipt",      label: "Orders"     },
        { id: "analytics",  href: "analytics.html",   icon: "fa-chart-line",   label: "Analytics"  },
        { id: "settings",   href: "settings.html",    icon: "fa-gear",         label: "Settings"   }
    ];

    const links = nav.map(item => `
        <a href="${item.href}" class="nav-link${activePage === item.id ? " active" : ""}">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>
        </a>
    `).join("");

    const html = `
        <div class="sidebar-top">
            <h2 class="sidebar-logo">OZONE</h2>
            <p class="sidebar-tagline">Admin Portal</p>
        </div>

        <nav class="sidebar-nav">
            ${links}
        </nav>

        <div class="sidebar-footer">
            <div class="admin-profile">
                <img id="admin-picture" src="" alt="Admin" class="admin-avatar" onerror="this.style.display='none'">
                <div class="admin-info">
                    <span id="admin-name" class="admin-name">Loading…</span>
                    <span id="admin-role" class="admin-role"></span>
                </div>
            </div>
            <button id="logout-btn" class="logout-btn" title="Sign out">
                <i class="fas fa-right-from-bracket"></i>
            </button>
        </div>
    `;

    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.innerHTML = html;
}
