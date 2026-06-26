/*=========================================================
    OZONE FILTER ENGINE
==========================================================*/

"use strict";

class OzoneFilters {

    constructor(menuInstance) {

        this.menu = menuInstance;

        this.searchDelay = null;

        this.elements = {};

    }

}
/*=========================================================
    CACHE DOM
==========================================================*/

OzoneFilters.prototype.cacheDOM = function () {

    this.elements = {

        search:

            document.getElementById("menuSearch"),

        sort:

            document.getElementById("sortMenu"),

        priceMin:

            document.getElementById("priceMin"),

        priceMax:

            document.getElementById("priceMax"),

        caloriesMin:

            document.getElementById("caloriesMin"),

        caloriesMax:

            document.getElementById("caloriesMax"),

        dietary:

            document.getElementById("dietaryFilter"),

        availability:

            document.getElementById("availabilityFilter"),

        chef:

            document.getElementById("chefFilter"),

        featured:

            document.getElementById("featuredFilter"),

        seasonal:

            document.getElementById("seasonalFilter"),

        specials:

            document.getElementById("specialFilter")

    };

};
/*=========================================================
    SEARCH
==========================================================*/

OzoneFilters.prototype.search = function (value) {

    value = value.toLowerCase().trim();

    this.menu.filters.search = value;

    this.menu.refresh();

};
/*=========================================================
    PRICE FILTER
==========================================================*/

OzoneFilters.prototype.price = function () {

    this.menu.filters.price.min =

        Number(this.elements.priceMin.value) || 0;

    this.menu.filters.price.max =

        Number(this.elements.priceMax.value) || Infinity;

    this.menu.refresh();

};
/*=========================================================
    CALORIES
==========================================================*/

OzoneFilters.prototype.calories = function () {

    this.menu.filters.calories.min =

        Number(this.elements.caloriesMin.value) || 0;

    this.menu.filters.calories.max =

        Number(this.elements.caloriesMax.value) || Infinity;

    this.menu.refresh();

};
/*=========================================================
    TOGGLES
==========================================================*/

OzoneFilters.prototype.toggles = function () {

    this.menu.filters.featuredOnly =

        this.elements.featured.checked;

    this.menu.filters.chefOnly =

        this.elements.chef.checked;

    this.menu.filters.seasonalOnly =

        this.elements.seasonal.checked;

    this.menu.filters.dailySpecialOnly =

        this.elements.specials.checked;

    this.menu.filters.availability =

        this.elements.availability.checked;

    this.menu.refresh();

};
/*=========================================================
    SORT
==========================================================*/

OzoneFilters.prototype.sort = function () {

    this.menu.sort.by =

        this.elements.sort.value;

    this.menu.refresh();

};
/*=========================================================
    DEBOUNCE
==========================================================*/

OzoneFilters.prototype.debounce = function (

    callback,

    delay = 300

) {

    clearTimeout(this.searchDelay);

    this.searchDelay =

        setTimeout(callback, delay);

};
/*=========================================================
    EVENTS
==========================================================*/

OzoneFilters.prototype.attachEvents = function () {

    if (this.elements.search) {

        this.elements.search

            .addEventListener(

                "keyup",

                e => {

                    this.debounce(() => {

                        this.search(

                            e.target.value

                        );

                    });

                }

            );

    }

    this.elements.sort?.addEventListener(

        "change",

        () => this.sort()

    );

    this.elements.priceMin?.addEventListener(

        "input",

        () => this.price()

    );

    this.elements.priceMax?.addEventListener(

        "input",

        () => this.price()

    );

    this.elements.caloriesMin?.addEventListener(

        "input",

        () => this.calories()

    );

    this.elements.caloriesMax?.addEventListener(

        "input",

        () => this.calories()

    );

    [

        this.elements.featured,

        this.elements.chef,

        this.elements.seasonal,

        this.elements.specials,

        this.elements.availability

    ]

    .filter(Boolean)

    .forEach(input => {

        input.addEventListener(

            "change",

            () => this.toggles()

        );

    });

};
/*=========================================================
    START
==========================================================*/

OzoneFilters.prototype.start = function () {

    this.cacheDOM();

    this.attachEvents();

};
/*=========================================================
    INITIALIZE
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const wait = setInterval(() => {

            if (

                window.OZONE_MENU &&

                window.OZONE_MENU.ready

            ) {

                window.OZONE_FILTERS =

                    new OzoneFilters(

                        window.OZONE_MENU

                    );

                OZONE_FILTERS.start();

                clearInterval(wait);

            }

        }, 100);

    }

);