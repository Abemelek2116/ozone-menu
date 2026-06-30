/*=========================================================
    OZONE
    main.js

    Core Application

==========================================================*/

"use strict";

/*=========================================================
    APP
==========================================================*/

class OzoneApp {

    constructor() {

        this.loader = document.getElementById("loader");

        this.navbar = document.getElementById("navbar");

        this.progressBar = document.getElementById("progress-bar");

        this.mobileMenuController = null;

        this.openMenu = document.getElementById("openMenu");

        this.audio = document.getElementById("ambientAudio");

        this.audioToggle = document.getElementById("audioToggle");

        this.backToTop = document.getElementById("backToTop");

        this.hero = document.querySelector(".hero");

    }

    init() {

        this.loadingScreen();

        this.scrollRestoration();

        this.initializeLenis();

        this.navigation();

        this.progress();

        this.mobileNavigation();

        this.backToTopButton();

        this.audioControls();

        this.heroMouseMovement();

        this.mouseSpotlight();

        this.activeNavigation();

        this.lazyImages();

        this.resizeEvents();

        this.shortcuts();

        this.performanceInfo();

        this.errors();

        this.visibility();

        this.preloadImages();
    }

}



/*=========================================================
    INITIALIZE
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    window.OZONE = new OzoneApp();

    OZONE.init();

});
/*=========================================================
    LOADER
==========================================================*/

OzoneApp.prototype.loadingScreen = function () {

    const hideLoader = () => {

        if(!this.loader || this.loader.classList.contains("loader-hide")) return;

        this.loader.classList.add("loader-hide");

        setTimeout(() => {

            this.loader.style.display = "none";

        }, 1000);

    };

    window.addEventListener("load", () => setTimeout(hideLoader, 2800));

    // Fallback if load event is delayed (e.g. slow video)
    setTimeout(hideLoader, 4500);

};
/*=========================================================
    LENIS
==========================================================*/

OzoneApp.prototype.initializeLenis = function () {

    if(typeof Lenis === "undefined") return;

    this.lenis = new Lenis({

        duration:1.2,

        smoothWheel:true,

        wheelMultiplier:1,

        touchMultiplier:2,

        infinite:false

    });

    const lenis = this.lenis;

    function raf(time){

        lenis.raf(time);

        requestAnimationFrame(raf);

    }

    requestAnimationFrame(raf);

};
/*=========================================================
    NAVBAR
==========================================================*/

OzoneApp.prototype.navigation = function(){

    window.addEventListener("scroll",()=>{

        if(window.scrollY>80){

            this.navbar.classList.add("scrolled");

        }

        else{

            this.navbar.classList.remove("scrolled");

        }

    });

};
/*=========================================================
    PROGRESS BAR
==========================================================*/

OzoneApp.prototype.progress = function(){

    window.addEventListener("scroll",()=>{

        const total =

            document.documentElement.scrollHeight -

            window.innerHeight;

        const current =

            window.scrollY;

        const percent =

            (current/total)*100;

        this.progressBar.style.width =

            percent+"%";

    });

};
/*=========================================================
    MOBILE MENU
==========================================================*/

OzoneApp.prototype.mobileNavigation = function(){

    if(typeof OzoneMobileMenu === "undefined") return;

    this.mobileMenuController = new OzoneMobileMenu({ lenis:this.lenis });

    this.mobileMenuController.init();

};
/*=========================================================
    BACK TO TOP
==========================================================*/

OzoneApp.prototype.backToTopButton=function(){

    window.addEventListener("scroll",()=>{

        if(window.scrollY>600){

            this.backToTop.style.opacity="1";

            this.backToTop.style.pointerEvents="auto";

        }

        else{

            this.backToTop.style.opacity="0";

            this.backToTop.style.pointerEvents="none";

        }

    });

    this.backToTop.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

};
/*=========================================================
    AUDIO
==========================================================*/

OzoneApp.prototype.audioControls=function(){

    if(!this.audio)return;

    let playing=false;

    this.audioToggle.addEventListener("click",()=>{

        if(!playing){

            this.audio.play();

            playing=true;

            this.audioToggle.innerHTML=

            '<i class="fa-solid fa-volume-high"></i>';

        }

        else{

            this.audio.pause();

            playing=false;

            this.audioToggle.innerHTML=

            '<i class="fa-solid fa-volume-xmark"></i>';

        }

    });

};
/*=========================================================
    HERO PARALLAX
==========================================================*/

OzoneApp.prototype.heroMouseMovement=function(){

    if(!this.hero)return;

    this.hero.addEventListener("mousemove",(e)=>{

        const x=

        (e.clientX/window.innerWidth-.5)*20;

        const y=

        (e.clientY/window.innerHeight-.5)*20;

        this.hero.style.transform=

        `rotateY(${x}deg)
         rotateX(${-y}deg)`;

    });

    this.hero.addEventListener("mouseleave",()=>{

        this.hero.style.transform=

        "rotateX(0) rotateY(0)";

    });

};
/*=========================================================
    PRELOAD IMAGES
==========================================================*/

OzoneApp.prototype.preloadImages=function(){

    const images=document.images;

    [...images].forEach(img=>{

        const image=new Image();

        image.src=img.src;

    });

};
/*=========================================================
    ACTIVE NAVIGATION
==========================================================*/

OzoneApp.prototype.activeNavigation = function(){

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    if(!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(!entry.isIntersecting) return;

            const id = entry.target.id;

            navLinks.forEach(link=>{

                link.classList.toggle(
                    "active",
                    link.getAttribute("href")==="#" + id
                );

            });

        });

    },{

        threshold:.45

    });

    sections.forEach(section=>observer.observe(section));

};



/*=========================================================
    LAZY IMAGES
==========================================================*/

OzoneApp.prototype.lazyImages = function(){

    const images = document.querySelectorAll("img[data-src]");

    if(!images.length) return;

    const observer = new IntersectionObserver((entries,observer)=>{

        entries.forEach(entry=>{

            if(!entry.isIntersecting) return;

            const img = entry.target;

            img.src = img.dataset.src;

            img.removeAttribute("data-src");

            observer.unobserve(img);

        });

    },{

        rootMargin:"150px"

    });

    images.forEach(img=>observer.observe(img));

};



/*=========================================================
    SPOTLIGHT
==========================================================*/

OzoneApp.prototype.mouseSpotlight = function(){

    const spotlight = document.getElementById("mouseSpotlight");

    if(!spotlight) return;

    document.addEventListener("mousemove",(e)=>{

        spotlight.style.opacity=".9";

        spotlight.style.left=e.clientX+"px";

        spotlight.style.top=e.clientY+"px";

    });

};
/*=========================================================
    RESIZE
==========================================================*/

OzoneApp.prototype.resizeEvents=function(){

    let resizeTimer;

    window.addEventListener("resize",()=>{

        clearTimeout(resizeTimer);

        resizeTimer=setTimeout(()=>{

            document.body.classList.add("resized");

            setTimeout(()=>{

                document.body.classList.remove("resized");

            },300);

        },150);

    });

};
/*=========================================================
    SHORTCUTS
==========================================================*/

OzoneApp.prototype.shortcuts=function(){

    document.addEventListener("keydown",(e)=>{

        if(e.key==="Escape"){

            this.mobileMenuController?.close();

        }

        if(e.key.toLowerCase()==="t"){

            this.backToTop?.click();

        }

    });

};
/*=========================================================
    SCROLL RESTORATION
==========================================================*/

OzoneApp.prototype.scrollRestoration=function(){

    if("scrollRestoration" in history){

        history.scrollRestoration="manual";

    }

    window.scrollTo(0,0);

};
/*=========================================================
    FPS LOG
==========================================================*/

OzoneApp.prototype.performanceInfo=function(){

    if(location.hostname==="localhost"){

        console.log(

            "%cOZONE",

            "color:#D4AF37;font-size:18px;font-weight:bold;"

        );

        console.log("Performance Mode Enabled");

    }

};
/*=========================================================
    ERROR HANDLER
==========================================================*/

OzoneApp.prototype.errors=function(){

    window.addEventListener("error",(e)=>{

        console.error(

            "OZONE Error:",

            e.message

        );

    });

};
/*=========================================================
    PAGE VISIBILITY
==========================================================*/

OzoneApp.prototype.visibility=function(){

    document.addEventListener("visibilitychange",()=>{

        if(document.hidden){

            document.body.classList.add("paused");

        }

        else{

            document.body.classList.remove("paused");

        }

    });

};
