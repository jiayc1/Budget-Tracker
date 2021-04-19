const indexedDB =
    window.indexedDB ||
    window.webkitIndexedDB ||
    window.mozIndexedDB ||
    window.shimIndexedDB ||
    window.msIndexedDB;


let db;
const request = indexedDB.open("budgetracker", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("OHShit! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = async function () {
        if (getAll.result.length > 0) {
            const response = await fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })


            const json = await response.json();
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
            return json;
        }
    };
}

window.addEventListener("online", checkDatabase);