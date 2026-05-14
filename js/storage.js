/**
 * Storage Management
 */

const STORAGE_KEY = 'biodata-anak';
const DARK_MODE_KEY = 'dark-mode';

const Storage = {
  /**
   * Get biodata from localStorage
   * @returns {Array}
   */
  getBiodata() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return safeJsonParse(saved, []);
  },

  /**
   * Save biodata to localStorage
   * @param {Array} data
   */
  setBiodata(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage Error:', error);
      showToast('Gagal menyimpan data', 'error');
      return false;
    }
  },

  /**
   * Get dark mode preference
   * @returns {Boolean}
   */
  getDarkMode() {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  },

  /**
   * Set dark mode preference
   * @param {Boolean} enabled
   */
  setDarkMode(enabled) {
    localStorage.setItem(DARK_MODE_KEY, enabled);
  },

  /**
   * Clear all data
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
