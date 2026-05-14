/**
 * Modal Management
 */

const Modal = {
  /**
   * Show detail modal
   * @param {Object} item
   * @param {String} foto
   */
  showDetail(item, foto) {
    const modal = getElement('detailModal');
    const modalContent = getElement('modalContent');

    if (!modal || !modalContent) return;

    const safeItem = {
      nama: formatDisplayText(item.nama),
      nomor_induk: formatDisplayText(item.nomor_induk),
      kelas: formatDisplayText(item.kelas),
      ttl: formatDisplayText(item.ttl),
      jk: formatDisplayText(item.jk),
      wali: formatDisplayText(item.wali),
      hafalan: formatDisplayText(item.hafalan),
      alamat: formatDisplayText(item.alamat)
    };

    modalContent.innerHTML = `
      <div id="pdfArea">
        <div class="text-center">
          <img src="${escapeHtml(foto)}" alt="${escapeHtml(item.nama)}" class="w-36 h-36 rounded-full mx-auto object-cover shadow-xl border-4 border-orange-400" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama)}'">
          <h2 class="mt-5 text-3xl font-bold">${safeItem.nama}</h2>
          <div class="mt-3 inline-block bg-orange-100 text-orange-600 px-5 py-2 rounded-full">
            ${safeItem.kelas}
          </div>
        </div>

        <div class="mt-8 space-y-4 text-gray-700">
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Nomor Induk:</strong><br>${safeItem.nomor_induk}
          </div>
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Tempat Tanggal Lahir:</strong><br>${safeItem.ttl}
          </div>
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Jenis Kelamin:</strong><br>${safeItem.jk}
          </div>
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Alamat:</strong><br>${safeItem.alamat}
          </div>
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Nama Wali:</strong><br>${safeItem.wali}
          </div>
          <div class="p-4 rounded-2xl bg-orange-50">
            <strong>Hafalan:</strong><br>${safeItem.hafalan}
          </div>
        </div>

        <button class="w-full mt-8 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600" onclick="PDF.download(${escapeHtml(JSON.stringify(item))}, '${escapeHtml(foto)}')">Download PDF Biodata</button>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  /**
   * Close modal
   */
  close() {
    const modal = getElement('detailModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
};

/**
 * PDF Download
 */
const PDF = {
  /**
   * Download PDF
   * @param {Object} item
   * @param {String} foto
   */
  async download(item, foto) {
    try {
      const element = document.createElement('div');

      // Convert blob URL to data URL
      let imageSrc = foto;
      if (foto.startsWith('blob:')) {
        imageSrc = await blobToDataUrl(foto) || foto;
      }

      const safeItem = {
        nama: formatDisplayText(item.nama),
        nomor_induk: formatDisplayText(item.nomor_induk),
        kelas: formatDisplayText(item.kelas),
        ttl: formatDisplayText(item.ttl),
        jk: formatDisplayText(item.jk),
        wali: formatDisplayText(item.wali),
        hafalan: formatDisplayText(item.hafalan),
        alamat: formatDisplayText(item.alamat)
      };

      element.innerHTML = `
        <div style="padding:40px;font-family:Poppins;">
          <div style="text-align:center;">
            <img src="${imageSrc}" style="width:150px;height:150px;border-radius:50%;object-fit:cover;border:5px solid orange;">
            <h1>${safeItem.nama}</h1>
            <p>${safeItem.kelas}</p>
          </div>
          <hr>
          <h3>Nomor Induk</h3>
          <p>${safeItem.nomor_induk}</p>
          <h3>TTL</h3>
          <p>${safeItem.ttl}</p>
          <h3>Jenis Kelamin</h3>
          <p>${safeItem.jk}</p>
          <h3>Alamat</h3>
          <p>${safeItem.alamat}</p>
          <h3>Wali</h3>
          <p>${safeItem.wali}</p>
          <h3>Hafalan</h3>
          <p>${safeItem.hafalan}</p>
        </div>
      `;

      html2pdf().from(element).save((item.nama || 'biodata') + '.pdf');
      showToast('PDF berhasil didownload');
    } catch (error) {
      console.error('PDF download error:', error);
      showToast('Gagal download PDF', 'error');
    }
  }
};
