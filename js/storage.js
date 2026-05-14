/**
 * IndexedDB Storage Management
 * Menggantikan localStorage dengan IndexedDB untuk kapasitas lebih besar
 */

const DB_NAME = 'BiodataAnakDB';
const DB_VERSION = 1;
const STUDENTS_STORE = 'students';
const PHOTOS_STORE = 'photos';
const SETTINGS_STORE = 'settings';

let db = null;
let dbReady = false;

/**
 * Initialize IndexedDB
 */
async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB Error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      dbReady = true;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const newDb = event.target.result;

      // Create students object store
      if (!newDb.objectStoreNames.contains(STUDENTS_STORE)) {
        const studentsStore = newDb.createObjectStore(STUDENTS_STORE, { keyPath: 'id', autoIncrement: true });
        studentsStore.createIndex('nomor_induk', 'nomor_induk', { unique: false });
        studentsStore.createIndex('nama', 'nama', { unique: false });
        studentsStore.createIndex('kelas', 'kelas', { unique: false });
      }

      // Create photos object store
      if (!newDb.objectStoreNames.contains(PHOTOS_STORE)) {
        newDb.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
      }

      // Create settings object store
      if (!newDb.objectStoreNames.contains(SETTINGS_STORE)) {
        newDb.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }

      console.log('IndexedDB schema created');
    };
  });
}

/**
 * Storage API Object
 */
const Storage = {
  /**
   * Get all biodata from IndexedDB
   * @returns {Promise<Array>}
   */
  async getBiodata() {
    if (!dbReady) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readonly');
      const store = tx.objectStore(STUDENTS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Save biodata to IndexedDB
   * @param {Array} data
   * @returns {Promise<Boolean>}
   */
  async setBiodata(data) {
    if (!dbReady) {
      console.error('Database not ready');
      return false;
    }

    try {
      // Clear existing data
      await this.clearBiodata();

      // Insert new data
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STUDENTS_STORE], 'readwrite');
        const store = tx.objectStore(STUDENTS_STORE);

        data.forEach((item, index) => {
          store.add({ ...item, id: index + 1 });
        });

        tx.onerror = () => reject(tx.error);
        tx.oncomplete = () => resolve(true);
      });
    } catch (error) {
      console.error('Error saving biodata:', error);
      return false;
    }
  },

  /**
   * Add single student
   * @param {Object} studentData
   * @returns {Promise<Number>}
   */
  async addStudent(studentData) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readwrite');
      const store = tx.objectStore(STUDENTS_STORE);
      const request = store.add(studentData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Update student data
   * @param {Object} studentData
   * @returns {Promise<void>}
   */
  async updateStudent(studentData) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readwrite');
      const store = tx.objectStore(STUDENTS_STORE);
      const request = store.put(studentData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Delete student data
   * @param {Number} id
   * @returns {Promise<void>}
   */
  async deleteStudent(id) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readwrite');
      const store = tx.objectStore(STUDENTS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Search students by name
   * @param {String} searchTerm
   * @returns {Promise<Array>}
   */
  async searchStudents(searchTerm) {
    if (!dbReady) return [];

    const allStudents = await this.getBiodata();
    const term = searchTerm.toLowerCase();

    return allStudents.filter(student => {
      const nama = (student.nama || '').toLowerCase();
      const noInduk = (student.nomor_induk || '').toLowerCase();
      return nama.includes(term) || noInduk.includes(term);
    });
  },

  /**
   * Get students by class
   * @param {String} kelas
   * @returns {Promise<Array>}
   */
  async getStudentsByClass(kelas) {
    if (!dbReady) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readonly');
      const store = tx.objectStore(STUDENTS_STORE);
      const index = store.index('kelas');
      const request = index.getAll(kelas);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Clear all biodata
   * @returns {Promise<void>}
   */
  async clearBiodata() {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STUDENTS_STORE], 'readwrite');
      const store = tx.objectStore(STUDENTS_STORE);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // ============ PHOTO STORAGE ============

  /**
   * Save photo as blob
   * @param {String} photoKey - nomor_induk or nama
   * @param {Blob} blob
   * @returns {Promise<void>}
   */
  async savePhoto(photoKey, blob) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = tx.objectStore(PHOTOS_STORE);
      const request = store.put({ id: photoKey, blob: blob });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Get photo blob
   * @param {String} photoKey
   * @returns {Promise<Blob|null>}
   */
  async getPhoto(photoKey) {
    if (!dbReady) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([PHOTOS_STORE], 'readonly');
      const store = tx.objectStore(PHOTOS_STORE);
      const request = store.get(photoKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
    });
  },

  /**
   * Convert blob to data URL
   * @param {Blob} blob
   * @returns {Promise<String>}
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Get photo URL (data URL or placeholder)
   * @param {String} photoKey
   * @param {String} fallbackName
   * @returns {Promise<String>}
   */
  async getPhotoUrl(photoKey, fallbackName = 'User') {
    try {
      const blob = await this.getPhoto(photoKey);
      if (blob) {
        return await this.blobToDataUrl(blob);
      }
    } catch (error) {
      console.error('Error getting photo:', error);
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff`;
  },

  /**
   * Delete photo
   * @param {String} photoKey
   * @returns {Promise<void>}
   */
  async deletePhoto(photoKey) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = tx.objectStore(PHOTOS_STORE);
      const request = store.delete(photoKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Clear all photos
   * @returns {Promise<void>}
   */
  async clearPhotos() {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = tx.objectStore(PHOTOS_STORE);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // ============ SETTINGS STORAGE ============

  /**
   * Get setting value
   * @param {String} key
   * @param {*} defaultValue
   * @returns {Promise<*>}
   */
  async getSetting(key, defaultValue = null) {
    if (!dbReady) return defaultValue;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([SETTINGS_STORE], 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };
    });
  },

  /**
   * Set setting value
   * @param {String} key
   * @param {*} value
   * @returns {Promise<void>}
   */
  async setSetting(key, value) {
    if (!dbReady) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const tx = db.transaction([SETTINGS_STORE], 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Get dark mode preference
   * @returns {Promise<Boolean>}
   */
  async getDarkMode() {
    return this.getSetting('darkMode', false);
  },

  /**
   * Set dark mode preference
   * @param {Boolean} enabled
   * @returns {Promise<void>}
   */
  async setDarkMode(enabled) {
    return this.setSetting('darkMode', enabled);
  },

  /**
   * Get database stats
   * @returns {Promise<Object>}
   */
  async getStats() {
    if (!dbReady) return { students: 0, photos: 0 };

    try {
      const studentTx = db.transaction([STUDENTS_STORE], 'readonly');
      const studentStore = studentTx.objectStore(STUDENTS_STORE);
      const studentCount = await new Promise((resolve) => {
        const req = studentStore.count();
        req.onsuccess = () => resolve(req.result);
      });

      const photoTx = db.transaction([PHOTOS_STORE], 'readonly');
      const photoStore = photoTx.objectStore(PHOTOS_STORE);
      const photoCount = await new Promise((resolve) => {
        const req = photoStore.count();
        req.onsuccess = () => resolve(req.result);
      });

      return { students: studentCount, photos: photoCount };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { students: 0, photos: 0 };
    }
  }
};

// Initialize database when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await initIndexedDB();
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      showToast('Gagal inisialisasi database', 'error');
    }
  });
} else {
  initIndexedDB().catch(error => {
    console.error('Failed to initialize IndexedDB:', error);
  });
}
