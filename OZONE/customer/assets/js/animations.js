/*=========================================================
    OZONE
    animations.js

    GSAP Animation Engine

==========================================================*/

"use strict";

/*=========================================================
    REGISTER GSAP PLUGINS
==========================================================*/

gsap.registerPlugin(

    ScrollTrigger

);

/*=========================================================
    MASTER CONTROLLER
==========================================================*/

class OzoneAnimations{

    constructor(){

        this.defaults={

            duration:1.2,

            ease:"power3.out"

        };

    }

    init(){

   
    this.refresh();

    this.globalDefaults();

    this.hero();

    this.sectionReveal();

    this.imageReveal();

    this.cards();

    this.fadeText("h2");

    this.fadeText("p");

    // NEW CINEMATIC SYSTEM
    this.letterReveal();

    this.storyScenes();

    this.parallax();

    this.floatingElements();

    this.heroDepth();

    this.staggerGrid();

    this.sceneTransitions();

    }

}

/*=========================================================
    INITIALIZE
==========================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    window.ANIMATIONS=new OzoneAnimations();

    ANIMATIONS.init();

});
/*=========================================================
    GLOBAL DEFAULTS
==========================================================*/

OzoneAnimations.prototype.globalDefaults=function(){

    gsap.defaults({

        duration:this.defaults.duration,

        ease:this.defaults.ease

    });

    ScrollTrigger.defaults({

        start:"top 80%",

        end:"bottom 20%",

        toggleActions:"play none none reverse"

    });

};
/*=========================================================
    REFRESH
==========================================================*/

OzoneAnimations.prototype.refresh=function(){

    window.addEventListener("load",()=>{

        ScrollTrigger.refresh();

    });

};
/*=========================================================
    SECTION REVEAL
==========================================================*/

OzoneAnimations.prototype.sectionReveal=function(){

    gsap.utils.toArray("section").forEach(section=>{

        gsap.from(section,{

            opacity:0,

            y:100,

            duration:1.1,

            scrollTrigger:{

                trigger:section

            }

        });

    });

};
/*=========================================================
    IMAGE REVEAL
==========================================================*/

OzoneAnimations.prototype.imageReveal=function(){

    gsap.utils.toArray(".story-image img").forEach(image=>{

        gsap.from(image,{

            scale:1.25,

            opacity:0,

            duration:1.4,

            scrollTrigger:{

                trigger:image

            }

        });

    });

};
/*=========================================================
    CARDS
==========================================================*/

OzoneAnimations.prototype.cards=function(){

    gsap.utils.toArray(

        ".preview-card,.award-card,.stat-card"

    ).forEach(card=>{

        gsap.from(card,{

            opacity:0,

            y:60,

            scale:.95,

            duration:1,

            scrollTrigger:{

                trigger:card

            }

        });

    });

};
/*=========================================================
    FADE TEXT
==========================================================*/

OzoneAnimations.prototype.fadeText=function(selector){

    gsap.utils.toArray(selector).forEach(text=>{

        gsap.from(text,{

            opacity:0,

            y:40,

            duration:.9,

            scrollTrigger:{

                trigger:text

            }

        });

    });

};
/*=========================================================
    HERO ENTRANCE
==========================================================*/

OzoneAnimations.prototype.hero=function(){

    const tl=gsap.timeline();

    tl

    .from(".hero-tag",{

        opacity:0,

        y:40

    })

    .from(".hero h1",{

        opacity:0,

        y:70

    },"-=0.4")

    .from(".typing-container",{

        opacity:0

    },"-=0.5")

    .from(".hero-buttons",{

        opacity:0,

        y:40

    },"-=0.5")

    .from(".scroll-indicator",{

        opacity:0

    },"-=0.4");

};
/*=========================================================
    LETTER REVEAL
==========================================================*/

OzoneAnimations.prototype.letterReveal = function () {

    const elements = document.querySelectorAll(".reveal-text");

    elements.forEach(el => {

        const text = el.textContent;

        el.textContent = "";

        const letters = text.split("");

        letters.forEach(letter => {

            const span = document.createElement("span");

            span.textContent = letter;

            el.appendChild(span);

        });

        gsap.to(el.querySelectorAll("span"), {

            y: 0,
            opacity: 1,
            stagger: 0.03,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el
            }

        });

    });

};
/*=========================================================
    STORY SCENES (PINNED SECTIONS)
==========================================================*/

OzoneAnimations.prototype.storyScenes = function () {

    const sections = document.querySelectorAll(".story-section");

    sections.forEach(section => {

        const content = section.querySelector(".story-content");
        const image = section.querySelector(".story-image");

        const tl = gsap.timeline({

            scrollTrigger: {

                trigger: section,
                start: "top top",
                end: "+=120%",
                scrub: true,
                pin: true

            }

        });

        tl.from(content, {

            opacity: 0,
            y: 80

        });

        tl.from(image, {

            opacity: 0,
            scale: 1.2

        }, "-=0.5");

    });

};
/*=========================================================
    PARALLAX SYSTEM
==========================================================*/

OzoneAnimations.prototype.parallax = function () {

    gsap.utils.toArray("[data-parallax]").forEach(el => {

        const speed = el.dataset.parallax || 0.2;

        gsap.to(el, {

            yPercent: -speed * 100,

            ease: "none",

            scrollTrigger: {

                trigger: el,
                scrub: true

            }

        });

    });

};
/*=========================================================
    FLOATING ELEMENTS
==========================================================*/

OzoneAnimations.prototype.floatingElements = function () {

    gsap.utils.toArray(".floating-item").forEach(item => {

        gsap.to(item, {

            y: -30,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"

        });

    });

};
/*=========================================================
    HERO DEPTH MOTION
==========================================================*/

OzoneAnimations.prototype.heroDepth = function () {

    const hero = document.querySelector(".hero");

    if (!hero) return;

    hero.addEventListener("mousemove", (e) => {

        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        gsap.to(hero, {

            rotateY: x,
            rotateX: -y,
            duration: 1

        });

    });

    hero.addEventListener("mouseleave", () => {

        gsap.to(hero, {

            rotateX: 0,
            rotateY: 0,
            duration: 1

        });

    });

};
/*=========================================================
    STAGGER GRID
==========================================================*/

OzoneAnimations.prototype.staggerGrid = function () {

    gsap.utils.toArray(".stagger-grid").forEach(grid => {

        gsap.from(grid.children, {

            opacity: 0,
            y: 60,
            stagger: 0.1,
            duration: 0.8,
            scrollTrigger: {
                trigger: grid
            }

        });

    });

};
/*=========================================================
    SCENE TRANSITIONS
==========================================================*/

OzoneAnimations.prototype.sceneTransitions = function () {

    const sections = document.querySelectorAll("section");

    sections.forEach(section => {

        gsap.to(section, {

            opacity: 1,
            y: 0,
            scrollTrigger: {

                trigger: section,
                start: "top 85%"

            }

        });

    });

};