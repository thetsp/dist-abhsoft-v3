globalThis.$indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

const openDB = (storeName = 'tspsoft', objectStoreName = "tspsoft-object-store") => new Promise(resolve => {
  let resoved = false
  setTimeout(() => { if (!resoved) { resolve(undefined) } }, 5000);

  if (!globalThis.$indexedDB) {
    // //globalThis.$logger.log("IndexedDB could not be found in this browser.");
    resolve(undefined)
  }

  const request = globalThis.$indexedDB.open(storeName, 1);

  request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
    resolve(undefined)
  };

  // Create or upgrade the database schema
  request.onupgradeneeded = function () {
    const db = request.result;

    // Create an object store with a keyPath of 'id'
    const store = db.createObjectStore(objectStoreName, { keyPath: "id" });
    // Create an index on the 'id' field for efficient lookups
    store.createIndex("id", "id", { unique: true });
  };

  // Handle database open success
  request.onsuccess = function () {
    // //globalThis.$logger.log("Database opened successfully");

    const db = request.result;

    resolve(db)
    resoved = true
  };

  // Handle database close
  request.onblocked = function () {
    // //globalThis.$logger.log("Database is blocked by another connection.");
    resolve(undefined)
  };

  // @ts-ignore
  request.onclose = function () {
    // //globalThis.$logger.log("Database connection closed.");
    resolve(undefined)
  };
})

const saveFormData = (db, id, formValues, objectStoreName = "tspsoft-object-store") => new Promise(resolve => {
  let resoved = false
  setTimeout(() => { if (!resoved) { resolve(null) } }, 5000);
  const transaction = db.transaction(objectStoreName, "readwrite");
  const store = transaction.objectStore(objectStoreName);
  store.put({ id, formValues });
  transaction.oncomplete = () => {
    // //globalThis.$logger.log(`Saved form data with ID: ${id}`);
    resoved = true
    resolve(id)
  };
})

const getFormData = (db, id, objectStoreName = "tspsoft-object-store"
) => new Promise(resolve => {
  let resoved = false
  setTimeout(() => { if (!resoved) { resolve(null) } }, 5000);
  const transaction = db.transaction(objectStoreName, "readonly");
  const store = transaction.objectStore(objectStoreName);
  const request = store.get(id);
  request.onsuccess = function () {
    const data = request.result;
    if (data) {
      //globalThis.$logger.log(`Retrieved form data with ID ${id}:`, data.formValues);
      resoved = true
      resolve(data.formValues)
    } else {
      // //globalThis.$logger.log(`No form data found with ID ${id}`);
      resoved = true
      resolve(null)
    }
  };
})

const removeFormData = (db, id, objectStoreName = "tspsoft-object-store"
) => new Promise(resolve => {
  let resoved = false
  setTimeout(() => { if (!resoved) { resolve(null) } }, 5000);

  const transaction = db.transaction(objectStoreName, "readwrite");
  const store = transaction.objectStore(objectStoreName);
  store.delete(id);
  transaction.oncomplete = () => {
    // //globalThis.$logger.log(`Removed form data with ID: ${id}`);
    resolve(id)
    resoved = true
  };
})

const closeDatabase = (db) => {
  db.close();
  // //globalThis.$logger.log("Database closed.");
}