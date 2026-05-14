/**
 * File Upload Handler dengan IndexedDB Support
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
      // Validasi tipe file
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        showToast('Format file harus .xlsx atau .csv', 'error');
        return;
      }

      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          if (!workbook.SheetNames.length) {
            showToast('File Excel tidak memiliki sheet', 'error');
            return;
          }

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

          // Simpan ke IndexedDB
          const success = await Storage.setBiodata(this.biodata);
          if (success) {
            showToast(`${this.biodata.length} data berhasil dimuat`);
            // Render UI
            await Renderer.renderCards();
            await Renderer.renderStatistics();
            await Renderer.renderFilter();
          } else {
            showToast('Gagal menyimpan data ke database', 'error');
          }
        } catch (error) {
          console.error('Excel parsing error:', error);
          showToast('Gagal membaca file Excel: ' + error.message, 'error');
        }
      };

      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        showToast('Gagal membaca file', 'error');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File upload error:', error);
      showToast('Terjadi kesalahan saat upload file: ' + error.message, 'error');
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
      let errorCount = 0;

      for (let file of files) {
        // Validasi file type
        if (!file.type.startsWith('image/')) {
          console.warn(`File ${file.name} bukan gambar, skip`);
          errorCount++;
          continue;
        }

        try {
          // Ambil nama file tanpa extension
          const filename = file.name.split('.')[0].toLowerCase().trim();

          // Simpan blob ke IndexedDB
          await Storage.savePhoto(filename, file);
          uploadedCount++;
        } catch (err) {
          console.error(`Error uploading photo ${file.name}:`, err);
          errorCount++;
        }
      }

      if (uploadedCount > 0) {
        showToast(`${uploadedCount} foto berhasil disimpan`);
        // Re-render untuk update foto
        await Renderer.renderCards();
      }
      if (errorCount > 0) {
        showToast(`${errorCount} file gagal diupload`, 'error');
      }
      if (uploadedCount === 0) {
        showToast('Tidak ada file gambar yang valid', 'error');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast('Gagal upload foto: ' + error.message, 'error');
    }
  },

  /**
   * Get photo URL for a student
   * @param {Object} item
   * @returns {Promise<String>}
   */
  async getPhotoUrl(item) {
    try {
      const keyFoto = (item.nomor_induk || item.nama || '').toString().toLowerCase().trim();
      return await Storage.getPhotoUrl(keyFoto, item.nama || 'User');
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama || 'User')}&background=random&color=fff`;
    }
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
        },
        {
          nomor_induk: '002',
          nama: 'Siti Nurhaliza',
          ttl: 'Jakarta, 15 Maret 2018',
          jk: 'Perempuan',
          alamat: 'Jl. Bunga No.5',
          wali: 'Ibu Siti',
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
      showToast('Gagal download template: ' + error.message, 'error');
    }
  },

  /**
   * Clear all data and photos
   */
  async clearData() {
    try {
      await Storage.clearBiodata();
      await Storage.clearPhotos();
      this.biodata = [];
      this.photoMap = {};
      showToast('Semua data berhasil dihapus');
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Gagal menghapus data: ' + error.message, 'error');
    }
  },

  /**
   * Export data to Excel
   */
  async exportToExcel() {
    try {
      const biodata = await Storage.getBiodata();
      if (!biodata.length) {
        showToast('Tidak ada data untuk diekspor', 'error');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(biodata);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Anak');
      XLSX.writeFile(workbook, `biodata-anak-${new Date().toISOString().split('T')[0]}.xlsx`);

      showToast('Data berhasil diekspor');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Gagal mengekspor data: ' + error.message, 'error');
    }
  }
};
