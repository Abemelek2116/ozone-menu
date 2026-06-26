/*==========================================================
    OZONE MAIN ENGINE
==========================================================*/

gsap.registerPlugin(ScrollTrigger);

/* Smooth scroll engine (Lenis) */
const lenis = new Lenis({

    duration: 1.2,

    smoothWheel: true,

    smoothTouch: false

});

/* Sync Lenis with GSAP */
function raf(time){

    lenis.raf(time);

    requestAnimationFrame(raf);

}

requestAnimationFrame(raf);
/*==========================================================
    LUXURY LOADER
==========================================================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("menuLoader");

    if(!loader) return;

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 3000);

});
/*==========================================================
    NAVBAR SCROLL EFFECT
==========================================================*/

const navbar = document.querySelector(".glass-navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 80){

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});
/*==========================================================
    SCROLL PROGRESS BAR
==========================================================*/

const progressBar = document.querySelector(".scroll-progress");

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;

    const docHeight = document.body.scrollHeight - window.innerHeight;

    const progress = (scrollTop / docHeight) * 100;

    if(progressBar){

        progressBar.style.width = progress + "%";

    }

});
/*==========================================================
    SECTION REVEAL ENGINE
==========================================================*/

const revealElements = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .zoom-in");

revealElements.forEach((el) => {

    gsap.to(el, {

        scrollTrigger:{

            trigger:el,

            start:"top 85%",

            toggleClass:"active"

        }

    });

});
/*==========================================================
    TEXT SPLIT PREPARATION
==========================================================*/

document.querySelectorAll(".reveal-text").forEach(el => {

    el.innerHTML = el.textContent

        .split("")

        .map(char => `<span>${char}</span>`)

        .join("");

});
/*==========================================================
    TEXT ANIMATION
==========================================================*/

gsap.utils.toArray(".reveal-text span").forEach((char, i) => {

    gsap.to(char, {

        scrollTrigger:{

            trigger:char,

            start:"top 90%"

        },

        y:0,

        opacity:1,

        delay:i * 0.02,

        duration:0.6,

        ease:"power3.out"

    });

});
/*==========================================================
    PARALLAX ENGINE
==========================================================*/

gsap.utils.toArray(".parallax-slow").forEach((el) => {

    gsap.to(el, {

        y: -80,

        scrollTrigger:{

            trigger:el,

            scrub:true

        }

    });

});

gsap.utils.toArray(".parallax-medium").forEach((el) => {

    gsap.to(el, {

        y: -150,

        scrollTrigger:{

            trigger:el,

            scrub:true

        }

    });

});
/*==========================================================
    3D CARD INTERACTION
==========================================================*/

document.querySelectorAll(".card-3d").forEach(card => {

    card.addEventListener("mousemove", (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;

        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;

        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `

            perspective(1000px)

            rotateX(${rotateX}deg)

            rotateY(${rotateY}deg)

            scale(1.05)

        `;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";

    });

});
/*==========================================================
    INIT COMPLETE
==========================================================*/

console.log("OZONE Luxury Engine Initialized ✨");