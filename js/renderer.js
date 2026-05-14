/**
 * UI Renderer dengan IndexedDB Support
 */

const Renderer = {
  /**
   * Render student cards
   */
  async renderCards() {
    try {
      const container = getElement('cardContainer');
      if (!container) return;

      // Get data from IndexedDB
      let biodata = await Storage.getBiodata();

      // Apply search filter
      const searchInput = getElement('searchInput');
      if (searchInput && searchInput.value) {
        biodata = await Storage.searchStudents(searchInput.value);
      }

      // Apply class filter
      const filterKelas = getElement('filterKelas');
      if (filterKelas && filterKelas.value) {
        biodata = biodata.filter(item => item.kelas === filterKelas.value);
      }

      // Clear container
      container.innerHTML = '';

      if (!biodata.length) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">Tidak ada data</div>';
        return;
      }

      // Render each card
      for (const item of biodata) {
        const photoUrl = await FileHandler.getPhotoUrl(item);
        const card = this.createCard(item, photoUrl);
        container.appendChild(card);
      }
    } catch (error) {
      console.error('Error rendering cards:', error);
      showToast('Gagal menampilkan data: ' + error.message, 'error');
    }
  },

  /**
   * Create a single card element
   * @param {Object} item
   * @param {String} photoUrl
   * @returns {HTMLElement}
   */
  createCard(item, photoUrl) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer hover:scale-105';
    card.innerHTML = `
      <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.nama || '')}" class="w-full h-40 object-cover bg-gray-200">
      <div class="p-4">
        <h3 class="font-bold text-lg truncate">${escapeHtml(item.nama || '-')}</h3>
        <p class="text-sm text-gray-600">No. ${escapeHtml(item.nomor_induk || '-')}</p>
        <p class="text-sm text-gray-500 truncate">${escapeHtml(item.kelas || '-')}</p>
        <button class="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold transition">
          Lihat Detail
        </button>
      </div>
    `;

    card.addEventListener('click', () => Modal.open(item));
    return card;
  },

  /**
   * Render statistics
   */
  async renderStatistics() {
    try {
      const biodata = await Storage.getBiodata();

      // Total data
      const totalDataEl = getElement('totalData');
      if (totalDataEl) totalDataEl.textContent = biodata.length;

      // Count by gender
      const maleCount = biodata.filter(item => (item.jk || '').toLowerCase() === 'laki-laki').length;
      const femaleCount = biodata.filter(item => (item.jk || '').toLowerCase() === 'perempuan').length;

      const totalLEl = getElement('totalL');
      if (totalLEl) totalLEl.textContent = maleCount;

      const totalPEl = getElement('totalP');
      if (totalPEl) totalPEl.textContent = femaleCount;

      // Count unique classes
      const classes = new Set(biodata.map(item => item.kelas).filter(Boolean));
      const totalKelasEl = getElement('totalKelas');
      if (totalKelasEl) totalKelasEl.textContent = classes.size;
    } catch (error) {
      console.error('Error rendering statistics:', error);
    }
  },

  /**
   * Render class filter options
   */
  async renderFilter() {
    try {
      const filterKelas = getElement('filterKelas');
      if (!filterKelas) return;

      const biodata = await Storage.getBiodata();
      const classes = [...new Set(biodata.map(item => item.kelas).filter(Boolean))].sort();

      // Preserve selected value
      const currentValue = filterKelas.value;

      // Clear and rebuild options
      filterKelas.innerHTML = '<option value="">Semua Kelas</option>';
      classes.forEach(kelas => {
        const option = document.createElement('option');
        option.value = kelas;
        option.textContent = kelas;
        filterKelas.appendChild(option);
      });

      // Restore selected value
      filterKelas.value = currentValue;
    } catch (error) {
      console.error('Error rendering filter:', error);
    }
  }
};
