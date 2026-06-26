/*==========================================================
    OZONE THEME SYSTEM
==========================================================*/

const themeToggle = document.querySelector("#themeToggle");

const savedTheme = localStorage.getItem("ozone-theme");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

document.documentElement.setAttribute("data-theme", currentTheme);
/*==========================================================
    APPLY THEME VARIABLES
==========================================================*/

function applyTheme(theme){

    if(theme === "dark"){

        document.documentElement.style.setProperty("--black", "#090909");
        document.documentElement.style.setProperty("--charcoal", "#151515");
        document.documentElement.style.setProperty("--surface", "#1E1E1E");
        document.documentElement.style.setProperty("--text", "#FFFFFF");

    } else {

        document.documentElement.style.setProperty("--black", "#F8F8F8");
        document.documentElement.style.setProperty("--charcoal", "#FFFFFF");
        document.documentElement.style.setProperty("--surface", "#F2F2F2");
        document.documentElement.style.setProperty("--text", "#111111");

    }

}
/*==========================================================
    INIT THEME
==========================================================*/

applyTheme(currentTheme);
/*==========================================================
    THEME TOGGLE
==========================================================*/

if(themeToggle){

    themeToggle.addEventListener("click", () => {

        document.body.classList.add("theme-transition");

        currentTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", currentTheme);

        applyTheme(currentTheme);

        localStorage.setItem("ozone-theme", currentTheme);

        setTimeout(() => {

            document.body.classList.remove("theme-transition");

        }, 600);

    });

}
/*==========================================================
    THEME TRANSITION EFFECT
==========================================================*/

const style = document.createElement("style");

style.innerHTML = `

.theme-transition{

    transition:all .6s ease;

    filter:blur(2px) brightness(1.1);

}

`;

document.head.appendChild(style);
/*==========================================================
    SYSTEM THEME LISTENER
==========================================================*/

window.matchMedia("(prefers-color-scheme: dark)")
.addEventListener("change", (e) => {

    if(!localStorage.getItem("ozone-theme")){

        currentTheme = e.matches ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", currentTheme);

        applyTheme(currentTheme);

    }

});
/*==========================================================
    ICON FEEDBACK
==========================================================*/

if(themeToggle){

    themeToggle.addEventListener("click", () => {

        themeToggle.classList.add("rotate");

        setTimeout(() => {

            themeToggle.classList.remove("rotate");

        }, 600);

    });

}
/*==========================================================
    TOGGLE ANIMATION STYLE
==========================================================*/

const toggleStyle = document.createElement("style");

toggleStyle.innerHTML = `

#themeToggle.rotate{

    transform:rotate(180deg);

    transition:.6s ease;

}

`;

document.head.appendChild(toggleStyle);
console.log("OZONE Theme System Active ✨");