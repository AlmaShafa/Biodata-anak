/**
 * Main Application
 */

class App {
  constructor() {
    this.init();
  }

  /**
   * Initialize app
   */
  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.applyDarkMode();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File upload buttons
    const uploadExcelBtn = getElement('uploadExcelBtn');
    const uploadPhotoBtn = getElement('uploadPhotoBtn');
    const downloadTemplateBtn = getElement('downloadTemplateBtn');
    const excelFile = getElement('excelFile');
    const photoFolder = getElement('photoFolder');
    const closeModalBtn = getElement('closeModalBtn');
    const darkModeBtn = getElement('darkModeBtn');
    const searchInput = getElement('searchInput');
    const filterKelas = getElement('filterKelas');

    // Excel upload
    if (uploadExcelBtn && excelFile) {
      uploadExcelBtn.addEventListener('click', () => excelFile.click());
    }
    if (excelFile) {
      excelFile.addEventListener('change', (e) => {
        FileHandler.handleExcelUpload(e.target.files[0]);
        e.target.value = ''; // Reset input
      });
    }

    // Photo upload
    if (uploadPhotoBtn && photoFolder) {
      uploadPhotoBtn.addEventListener('click', () => photoFolder.click());
    }
    if (photoFolder) {
      photoFolder.addEventListener('change', (e) => {
        FileHandler.handlePhotoUpload(e.target.files);
        e.target.value = ''; // Reset input
      });
    }

    // Download template
    if (downloadTemplateBtn) {
      downloadTemplateBtn.addEventListener('click', () => {
        FileHandler.downloadTemplate();
      });
    }

    // Modal close
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => Modal.close());
    }

    // Dark mode
    if (darkModeBtn) {
      darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
    }

    // Search with debounce
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        Renderer.renderCards();
      }, 300));
    }

    // Filter
    if (filterKelas) {
      filterKelas.addEventListener('change', () => {
        Renderer.renderCards();
      });
    }

    // Close modal on backdrop click
    const modal = getElement('detailModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          Modal.close();
        }
      });
    }
  }

  /**
   * Load initial data from storage
   */
  loadInitialData() {
    try {
      const saved = Storage.getBiodata();
      if (saved && saved.length > 0) {
        FileHandler.biodata = saved;
        Renderer.renderCards();
        Renderer.renderStatistics();
        Renderer.renderFilter();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Gagal memuat data yang tersimpan', 'error');
    }
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    const isDarkMode = Storage.getDarkMode();
    const newDarkMode = !isDarkMode;
    
    document.body.classList.toggle('dark-mode', newDarkMode);
    Storage.setDarkMode(newDarkMode);
    showToast(newDarkMode ? 'Dark Mode ON' : 'Dark Mode OFF');
  }

  /**
   * Apply dark mode on load
   */
  applyDarkMode() {
    if (Storage.getDarkMode()) {
      document.body.classList.add('dark-mode');
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}
