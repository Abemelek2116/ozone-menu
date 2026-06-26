/*==========================================================
    OZONE DATA ENGINE (SIMULATED BACKEND)
    Uses localStorage as shared database layer
==========================================================*/

const OZONE_DB_KEY = "OZONE_DATABASE";

/* INITIALIZE DATABASE */
function initDB() {

    if (!localStorage.getItem(OZONE_DB_KEY)) {

        const initialData = {
            menu: [],
            categories: [],
            orders: [],
            settings: {}
        };

        localStorage.setItem(OZONE_DB_KEY, JSON.stringify(initialData));
    }
}

/* GET DATABASE */
function getDB() {
    return JSON.parse(localStorage.getItem(OZONE_DB_KEY));
}

/* SAVE DATABASE */
function saveDB(db) {
    localStorage.setItem(OZONE_DB_KEY, JSON.stringify(db));
}

/* UPDATE MENU */
function updateMenu(menuData) {

    const db = getDB();
    db.menu = menuData;
    saveDB(db);

}

/* UPDATE CATEGORIES */
function updateCategories(catData) {

    const db = getDB();
    db.categories = catData;
    saveDB(db);

}

/* ADD ORDER */
function addOrder(order) {

    const db = getDB();
    db.orders.push(order);
    saveDB(db);

}

/* UPDATE SETTINGS */
function updateSettings(settings) {

    const db = getDB();
    db.settings = settings;
    saveDB(db);

}

/* EXPORT GLOBAL */
window.OZONE_DB = {
    initDB,
    getDB,
    saveDB,
    updateMenu,
    updateCategories,
    addOrder,
    updateSettings
};

initDB();

console.log("OZONE Data Engine Active ⚙️");