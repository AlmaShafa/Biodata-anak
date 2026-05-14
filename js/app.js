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
  async init() {
    // Tunggu database siap
    let retries = 0;
    while (!dbReady && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!dbReady) {
      console.error('Database failed to initialize');
      showToast('Gagal menginisialisasi database', 'error');
      return;
    }

    this.setupEventListeners();
    await this.loadInitialData();
    await this.applyDarkMode();
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
    if (uploadExcelBtn) {
      uploadExcelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (excelFile) excelFile.click();
      });
    }

    if (excelFile) {
      excelFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          FileHandler.handleExcelUpload(e.target.files[0]);
        }
        e.target.value = ''; // Reset input
      });
    }

    // Photo upload
    if (uploadPhotoBtn) {
      uploadPhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (photoFolder) photoFolder.click();
      });
    }

    if (photoFolder) {
      photoFolder.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          FileHandler.handlePhotoUpload(e.target.files);
        }
        e.target.value = ''; // Reset input
      });
    }

    // Download template
    if (downloadTemplateBtn) {
      downloadTemplateBtn.addEventListener('click', (e) => {
        e.preventDefault();
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
      searchInput.addEventListener('input', debounce(async () => {
        await Renderer.renderCards();
      }, 300));
    }

    // Filter
    if (filterKelas) {
      filterKelas.addEventListener('change', async () => {
        await Renderer.renderCards();
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
   * Load initial data from IndexedDB
   */
  async loadInitialData() {
    try {
      const biodata = await Storage.getBiodata();
      if (biodata && biodata.length > 0) {
        FileHandler.biodata = biodata;
        await Renderer.renderCards();
        await Renderer.renderStatistics();
        await Renderer.renderFilter();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Gagal memuat data yang tersimpan', 'error');
    }
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode() {
    try {
      const isDarkMode = await Storage.getDarkMode();
      const newDarkMode = !isDarkMode;

      document.body.classList.toggle('dark-mode', newDarkMode);
      await Storage.setDarkMode(newDarkMode);
      showToast(newDarkMode ? 'Dark Mode ON' : 'Dark Mode OFF');
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  }

  /**
   * Apply dark mode on load
   */
  async applyDarkMode() {
    try {
      const isDarkMode = await Storage.getDarkMode();
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      }
    } catch (error) {
      console.error('Error applying dark mode:', error);
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
