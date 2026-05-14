/**
 * File Upload Handler
 */

const FileHandler = {
  biodata: [],
  photoMap: {},

  /**
   * Handle Excel file upload
   * @param {File} file
   */
  async handleExcelUpload(file) {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          
          if (!sheet) {
            showToast('Sheet tidak ditemukan dalam file Excel', 'error');
            return;
          }

          this.biodata = XLSX.utils.sheet_to_json(sheet);

          // Validasi data
          if (!this.biodata.length) {
            showToast('File Excel kosong atau tidak valid', 'error');
            return;
          }

          // Save to storage
          Storage.setBiodata(this.biodata);
          showToast(`${this.biodata.length} data berhasil dimuat`);

          // Render UI
          Renderer.renderCards();
          Renderer.renderStatistics();
          Renderer.renderFilter();
        } catch (error) {
          console.error('Excel parsing error:', error);
          showToast('Gagal membaca file Excel', 'error');
        }
      };

      reader.onerror = () => {
        showToast('Gagal membaca file', 'error');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File upload error:', error);
      showToast('Terjadi kesalahan saat upload file', 'error');
    }
  },

  /**
   * Handle photo upload
   * @param {FileList} files
   */
  async handlePhotoUpload(files) {
    if (!files || files.length === 0) return;

    try {
      let uploadedCount = 0;

      for (let file of files) {
        // Validasi file type
        if (!file.type.startsWith('image/')) {
          console.warn(`File ${file.name} bukan gambar, skip`);
          continue;
        }

        const filename = file.name.split('.')[0].toLowerCase();
        this.photoMap[filename] = URL.createObjectURL(file);
        uploadedCount++;
      }

      if (uploadedCount > 0) {
        showToast(`${uploadedCount} foto berhasil dimuat`);
        Renderer.renderCards();
      } else {
        showToast('Tidak ada file gambar yang valid', 'error');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast('Gagal upload foto', 'error');
    }
  },

  /**
   * Get photo URL for a student
   * @param {Object} item
   * @returns {String}
   */
  getPhotoUrl(item) {
    const keyFoto = (item.nomor_induk || item.nama || '').toString().toLowerCase();
    return this.photoMap[keyFoto] || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama || 'User')}`;
  },

  /**
   * Download template Excel
   */
  downloadTemplate() {
    try {
      const data = [
        {
          nomor_induk: '001',
          nama: 'Ahmad Fauzi',
          ttl: 'Bandung, 12 Januari 2018',
          jk: 'Laki-laki',
          alamat: 'Jl. Melati No.1',
          wali: 'Bapak Ahmad',
          kelas: 'Kelas A',
          hafalan: 'Juz 30'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      XLSX.writeFile(workbook, 'template-biodata-anak.xlsx');
      
      showToast('Template berhasil didownload');
    } catch (error) {
      console.error('Template download error:', error);
      showToast('Gagal download template', 'error');
    }
  },

  /**
   * Clear all data
   */
  clearData() {
    this.biodata = [];
    this.photoMap = {};
    Storage.clear();
  }
};
