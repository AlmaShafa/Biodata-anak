/**
 * Rendering Functions
 */

const Renderer = {
  /**
   * Render card grid
   */
  renderCards() {
    const searchInput = getElement('searchInput');
    const filterKelas = getElement('filterKelas');
    const cardContainer = getElement('cardContainer');

    if (!cardContainer) return;

    const keyword = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedKelas = filterKelas ? filterKelas.value : '';

    // Filter data
    const filtered = FileHandler.biodata.filter(item => {
      const cocokNama = (item.nama || '').toLowerCase().includes(keyword);
      const cocokNomor = (item.nomor_induk || '').toString().includes(keyword);
      const cocokKelas = selectedKelas === '' || item.kelas === selectedKelas;

      return (cocokNama || cocokNomor) && cocokKelas;
    });

    // Render cards
    cardContainer.innerHTML = filtered.map(item => {
      const foto = FileHandler.getPhotoUrl(item);
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

      return `
        <div class="bg-white rounded-[30px] overflow-hidden shadow-2xl card-hover border border-orange-100">
          <div class="bg-gradient-to-r from-orange-400 to-emerald-500 h-28"></div>
          <div class="px-6 pb-6 -mt-14 text-center">
            <img src="${escapeHtml(foto)}" alt="${escapeHtml(item.nama)}" class="w-28 h-28 rounded-full border-4 border-white object-cover mx-auto shadow-xl" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama)}'">
            <h3 class="mt-5 text-2xl font-bold text-gray-800">${safeItem.nama}</h3>
            <div class="mt-3 inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
              ${safeItem.kelas}
            </div>
            <div class="mt-6 space-y-2 text-left text-sm text-gray-600">
              <p><strong>No Induk:</strong> ${safeItem.nomor_induk}</p>
              <p><strong>TTL:</strong> ${safeItem.ttl}</p>
              <p><strong>JK:</strong> ${safeItem.jk}</p>
              <p><strong>Wali:</strong> ${safeItem.wali}</p>
              <p><strong>Hafalan:</strong> ${safeItem.hafalan}</p>
            </div>
            <div class="mt-6 flex gap-3">
              <button class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-semibold" onclick="Modal.showDetail(${escapeHtml(JSON.stringify(item))}, '${escapeHtml(foto)}')">Detail</button>
              <button class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold" onclick="PDF.download(${escapeHtml(JSON.stringify(item))}, '${escapeHtml(foto)}')">PDF</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (filtered.length === 0) {
      cardContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Tidak ada data yang ditemukan</p>';
    }
  },

  /**
   * Render statistics
   */
  renderStatistics() {
    const totalData = getElement('totalData');
    const totalL = getElement('totalL');
    const totalP = getElement('totalP');
    const totalKelas = getElement('totalKelas');

    if (!totalData) return;

    totalData.innerText = FileHandler.biodata.length;

    const laki = FileHandler.biodata.filter(x => 
      (x.jk || '').toLowerCase().includes('l')
    ).length;
    const perempuan = FileHandler.biodata.filter(x => 
      (x.jk || '').toLowerCase().includes('p')
    ).length;

    if (totalL) totalL.innerText = laki;
    if (totalP) totalP.innerText = perempuan;

    const kelas = [...new Set(FileHandler.biodata.map(x => x.kelas).filter(Boolean))];
    if (totalKelas) totalKelas.innerText = kelas.length;
  },

  /**
   * Render filter dropdown
   */
  renderFilter() {
    const filterKelas = getElement('filterKelas');
    if (!filterKelas) return;

    const kelas = [...new Set(FileHandler.biodata.map(x => x.kelas).filter(Boolean))].sort();
    const options = '<option value="">Semua Kelas</option>' + 
      kelas.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');

    filterKelas.innerHTML = options;
  }
};
