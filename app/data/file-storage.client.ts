let db: IDBDatabase;

const init = () => {
  if (db || !indexedDB) return;

  const request: IDBOpenDBRequest = indexedDB.open('MyDatabase', 1);

  request.onerror = function (event) {
    console.log('Error opening the database.', (event.target as IDBOpenDBRequest).error);
  };

  request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    if (event.target) {
      db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('Files', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = function (event: Event) {
    if (event.target) {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully!');
    }
  };
};

const storeFile = (file: File) => {
  const transaction = db.transaction(['Files'], 'readwrite');
  const objectStore = transaction.objectStore('Files');

  const addFileRequest = objectStore.add({ file: file });

  addFileRequest.onsuccess = function () {
    console.log('File added to IndexedDB successfully.');
  };

  addFileRequest.onerror = function (event) {
    console.log('Error adding the file.', (event.target as IDBRequest).error);
  };
};

const retrieveFile = (callback: (file: File | null) => void): void => {
  const transaction = db.transaction(['Files'], 'readonly');
  const objectStore = transaction.objectStore('Files');

  const getFileRequest = objectStore.getAll();

  getFileRequest.onsuccess = function (event) {
    if (getFileRequest.result) {
      const file = getFileRequest.result[0].file;
      callback(file);
    } else {
      console.log('File not found in IndexedDB.');
      callback(null);
    }
  };

  getFileRequest.onerror = function (event) {
    console.log('Error retrieving the file.', (event.target as IDBRequest).error);
    callback(null);
  };
};

const clearDatabase = (callback: () => void) => {
  const transaction = db.transaction(['Files'], 'readwrite');
  const objectStore = transaction.objectStore('Files');

  const clearRequest = objectStore.clear();

  clearRequest.onsuccess = function () {
    console.log('IndexedDB cleared successfully.');
    callback();
  };

  clearRequest.onerror = function (event) {
    console.log('Error clearing the database.', (event.target as IDBRequest).error);
  };
};

init();

export { storeFile, retrieveFile, clearDatabase };
