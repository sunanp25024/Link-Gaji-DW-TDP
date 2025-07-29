document.addEventListener('DOMContentLoaded', function() {
    const tanggalLahirInput = document.getElementById('tanggal-lahir');
    
    if (tanggalLahirInput) {
        tanggalLahirInput.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            // Assuming you add an input field for age with id 'umur'
            // Make sure to add this field in your HTML as well, likely as a readonly input
            const umurInput = document.getElementById('umur');
            if(umurInput) {
                umurInput.value = age;
            }
        });
    }

    function setupLainnya(selectId, lainnyaGroupId) {
        const selectElement = document.getElementById(selectId);
        const lainnyaGroup = document.getElementById(lainnyaGroupId);

        if (selectElement && lainnyaGroup) {
            selectElement.addEventListener('change', function() {
                if (this.value === 'Lainnya') {
                    lainnyaGroup.classList.remove('hidden-group');
                } else {
                    lainnyaGroup.classList.add('hidden-group');
                }
            });
        }
    }

    setupLainnya('nama-bank', 'bank-lainnya-group');
    setupLainnya('agama', 'agama-lainnya-group');
    setupLainnya('status-perkawinan', 'status-perkawinan-lainnya-group');
    setupLainnya('tingkat-pendidikan', 'pendidikan-lainnya-group');
    setupLainnya('hubungan-kontak-darurat', 'hubungan-lainnya-group');

    // Initially hide all 'lainnya' groups
    document.querySelectorAll('.hidden-group').forEach(group => {
        group.classList.add('hidden-group');
    });

    const form = document.getElementById('payroll-form');
    const nikInput = document.getElementById('nik');
    const namaBankSelect = document.getElementById('nama-bank');
    const noRekeningInput = document.getElementById('no-rekening');
    const noRekeningError = document.getElementById('no-rekening-error');

    const bankAccountLengths = {
        'BCA': 10,
        'Mandiri': 13,
        'BRI': 15,
        'BNI': 10,
        'CIMB Niaga': 14,
        'BTN': 16,
        'Danamon': 10,
        'Permata': 10,
        'Maybank': 10,
        'Panin': 10,
        'OCBC NISP': 12,
        'UOB': 10,
        'HSBC': 12,
        'Standard Chartered': 10,
        'Bank Mega': 12,
        'Bank Syariah Indonesia': 10
    };

    if (namaBankSelect && noRekeningInput && noRekeningError) {
        const validateRekening = () => {
            const selectedBank = namaBankSelect.value;
            const requiredLength = bankAccountLengths[selectedBank];
            const currentValue = noRekeningInput.value;

            if (requiredLength) {
                if (/[^0-9]/.test(currentValue)) {
                    noRekeningError.textContent = 'Nomor rekening hanya boleh berisi angka.';
                    noRekeningError.style.display = 'block';
                    return;
                }
                
                const currentLength = currentValue.length;
                
                if (currentLength > 0 && currentLength < requiredLength) {
                    noRekeningError.textContent = `Panjang harus ${requiredLength} digit. Kurang ${requiredLength - currentLength} digit lagi.`;
                    noRekeningError.style.display = 'block';
                } else {
                    noRekeningError.textContent = '';
                    noRekeningError.style.display = 'none';
                }
            } else {
                noRekeningError.textContent = '';
                noRekeningError.style.display = 'none';
            }
        };

        namaBankSelect.addEventListener('change', function() {
            const selectedBank = this.value;
            const requiredLength = bankAccountLengths[selectedBank];
            
            noRekeningInput.value = '';

            if (requiredLength) {
                noRekeningInput.setAttribute('maxlength', requiredLength);
                noRekeningInput.setAttribute('pattern', `\\d{${requiredLength}}`);
                noRekeningInput.title = `Nomor rekening harus ${requiredLength} digit.`;
            } else {
                noRekeningInput.removeAttribute('maxlength');
                noRekeningInput.removeAttribute('pattern');
                noRekeningInput.removeAttribute('title');
            }
            validateRekening();
        });

        noRekeningInput.addEventListener('input', validateRekening);
    }

    const pages = Array.from(document.querySelectorAll('.page'));
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const dummyBtn = document.getElementById('dummy-btn');
    let currentPageIndex = pages.findIndex(page => page.classList.contains('current'));

    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle('current', i === index);
            page.classList.toggle('hidden', i !== index);
        });
        currentPageIndex = index;
        const isReviewPage = pages[currentPageIndex].id === 'page' + (pages.length - 2);
        const isSuccessPage = pages[currentPageIndex].id === 'page' + (pages.length - 1);

        prevBtn.style.display = (index > 0 && !isSuccessPage) ? 'inline-block' : 'none';
        nextBtn.style.display = (index < pages.length - 2 && !isSuccessPage) ? 'inline-block' : 'none';
        submitBtn.style.display = isReviewPage ? 'inline-block' : 'none';
        dummyBtn.style.display = (index === 0) ? 'inline-block' : 'none';
    }

    function validatePage(index) {
        const page = pages[index];
        const inputs = Array.from(page.querySelectorAll('input[required], select[required], textarea[required]'));
        for (const input of inputs) {
            // Check if the input is visible
            if (input.offsetParent === null) continue;

            if (!input.value.trim()) {
                // Find the label associated with the input
                const label = document.querySelector(`label[for='${input.id}']`);
                const labelText = label ? label.innerText : (input.name || input.id);
                alert(`Harap isi semua kolom yang wajib diisi: ${labelText}`);
                input.focus();
                return false;
            }
            if (input.pattern && !new RegExp(input.pattern).test(input.value)) {
                const label = document.querySelector(`label[for='${input.id}']`);
                const labelText = label ? label.innerText : (input.name || input.id);
                alert(`Format isian salah untuk: ${labelText}. ${input.title}`);
                input.focus();
                return false;
            }
        }
        return true;
    }

    function populateReviewContent() {
        const reviewContent = document.getElementById('review-content');
        if (!reviewContent) return;
        const formData = new FormData(form);
        let html = '<ul>';
        for (const [key, value] of formData.entries()) {
            const element = form.querySelector(`[name="${key}"]`);
            if (!element) continue;
            const label = document.querySelector(`label[for='${element.id}']`);
            const labelText = label ? label.innerText : (key);

            if (element.type === 'file') {
                html += `<li><strong>${labelText}:</strong> ${value.name || 'Tidak ada file'}</li>`;
            } else if (element.type === 'radio' || element.type === 'checkbox') {
                if (element.checked) {
                     html += `<li><strong>${labelText}:</strong> ${value || 'Tidak diisi'}</li>`;
                }
            } else {
                 html += `<li><strong>${labelText}:</strong> ${value || 'Tidak diisi'}</li>`;
            }
        }
        html += '</ul>';
        reviewContent.innerHTML = html;
    }

    nextBtn.addEventListener('click', () => {
        if (validatePage(currentPageIndex)) {
            const nextPageIndex = currentPageIndex + 1;
            if (pages[nextPageIndex].id === 'page' + (pages.length - 2)) { // If next is review page
                populateReviewContent();
            }
            showPage(nextPageIndex);
        }
    });

    prevBtn.addEventListener('click', () => {
        showPage(currentPageIndex - 1);
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', async function(event) {
            event.preventDefault();

            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';

            const formData = new FormData(form);

            try {
                const response = await fetch('http://localhost:3001/submit', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    showPage(pages.length - 1); // Show success page
                    const nama = document.getElementById('nama').value;
                    const waLink = document.getElementById('whatsapp-link');
                    const message = `Halo, saya ${nama} sudah mengisi form penggajian. Mohon diproses. Terima kasih.`;
                    waLink.href = `https://wa.me/6285156776329?text=${encodeURIComponent(message)}`;
                } else {
                    const errorResult = await response.json();
                    console.error('Submission failed:', errorResult);
                    alert(`Error: ${errorResult.message}`);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred while submitting the form. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kirim';
            }
        });
    }

    if (dummyBtn) {
        dummyBtn.addEventListener('click', fillWithDummyData);
    }

    // Initial page setup
    showPage(currentPageIndex);

    function fillWithDummyData() {
        // Page 1: Informasi Diri
        document.getElementById('opsid').value = 'OPS12345';
        document.getElementById('nama').value = 'Budi Doremi';
        document.getElementById('nik').value = '3278012345678901';
        document.getElementById('npwp').value = '987654321098765';
        document.getElementById('tempat-lahir').value = 'Jakarta';
        document.getElementById('tanggal-lahir').value = '1990-05-15';
        document.getElementById('tanggal-lahir').dispatchEvent(new Event('change')); // To trigger age calculation
        document.getElementById('jenis-kelamin').value = 'Laki-laki';
        document.getElementById('agama').value = 'Islam';
        document.getElementById('status-perkawinan').value = 'Belum Kawin';

        // Page 2: Kontak & Alamat
        document.getElementById('alamat-ktp').value = 'Jl. KTP No. 1, Jakarta';
        document.getElementById('alamat-domisili').value = 'Jl. Domisili No. 2, Bandung';
        document.getElementById('no-hp').value = '081234567890';
        document.getElementById('email').value = 'budi.doremi@example.com';

        // Page 3: Pendidikan & Bank
        document.getElementById('tingkat-pendidikan').value = 'S1';
        document.getElementById('jurusan').value = 'Teknik Informatika';
        document.getElementById('nama-sekolah').value = 'Universitas ABC';
        document.getElementById('nama-bank').value = 'BCA';
        document.getElementById('nama-bank').dispatchEvent(new Event('change'));
        document.getElementById('no-rekening').value = '1234567890';
        document.getElementById('no-rekening').dispatchEvent(new Event('input'));
        document.getElementById('pemilik-rekening').value = 'Budi Doremi';

        // Page 4: Kontak Darurat
        document.getElementById('nama-kontak-darurat').value = 'Siti';
        document.getElementById('hubungan-kontak-darurat').value = 'Saudara Kandung';
        document.getElementById('no-hp-darurat').value = '089876543210';

        alert('Data dummy telah diisi. Silakan lanjutkan ke halaman berikutnya.');
    }
            }
        });
    }

    // Initial setup
    showPage(1);
});

function fillWithDummyData() {
    const currentPage = document.querySelector('.page:not(.hidden)').id;

    if (currentPage === 'page1') {
        // Page 1 Data
        document.getElementById('ops-id').value = 'OPS12345';
        document.getElementById('nama').value = 'Budi Santoso';
        document.getElementById('nik').value = '3171234567890001';
        document.getElementById('tempat-lahir').value = 'Jakarta';
        document.getElementById('tanggal-lahir').value = '1995-08-17';
        document.getElementById('tanggal-lahir').dispatchEvent(new Event('change')); // To trigger age calculation
        document.getElementById('jenis-kelamin').value = 'Laki-laki';
        document.getElementById('alamat-ktp').value = 'Jl. Merdeka No. 10, Jakarta Pusat';
        document.getElementById('alamat-domisili').value = 'Jl. Kebangsaan No. 20, Jakarta Selatan';
        document.getElementById('rt-rw').value = '005/010';
        document.getElementById('no-rumah').value = '15A';
        document.getElementById('kelurahan').value = 'Cilandak';
        document.getElementById('kecamatan').value = 'Pasar Minggu';
        document.getElementById('kota').value = 'Jakarta Selatan';
        document.getElementById('kode-pos').value = '12560';
        document.getElementById('agama').value = 'Islam';
        document.getElementById('status-perkawinan').value = 'Belum Kawin';
        document.getElementById('kewarganegaraan').value = 'WNI';

        // Kontak
        document.getElementById('no-hp').value = '+6281234567890';
        document.getElementById('no-wa').value = '+6281234567890';
        document.getElementById('email').value = 'budi.santoso@example.com';

        // Pendidikan
        document.getElementById('tingkat-pendidikan').value = 'S1';
        document.getElementById('nama-sekolah').value = 'Universitas Indonesia';
        document.getElementById('jurusan').value = 'Teknik Informatika';
        document.getElementById('tahun-masuk').value = '2014';
        document.getElementById('tahun-lulus').value = '2018';
        document.getElementById('ipk').value = '3.75';

        // Kontak Darurat
        document.getElementById('nama-kontak-darurat').value = 'Siti Aminah';
        document.getElementById('no-hp-darurat').value = '+6281987654321';
        document.getElementById('no-wa-darurat').value = '+6281987654321';
        document.getElementById('hubungan-kontak-darurat').value = 'Orang Tua';

        // Bank
        document.getElementById('nama-bank').value = 'BCA';
        document.getElementById('no-rekening').value = '1234567890';
        document.getElementById('nama-penerima').value = 'Budi Santoso';
        // Trigger validation for bank account
        document.getElementById('nama-bank').dispatchEvent(new Event('change'));

        // Tambahan
        document.getElementById('npwp').value = '09.254.294.3-407.000';
        document.getElementById('nama-ibu').value = 'Siti Aminah';
        document.getElementById('nama-ayah').value = 'Joko Susilo';
    }
}

function nextPage(pageId) {
    // Panggil populateReview() tanpa validasi untuk tujuan peninjauan
    populateReview();
    showPage(pageId);
}

function prevPage(pageId) {
    showPage(pageId);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');

    if (pageId === 'page3') {
        generateWhatsAppLink();
    }
}

function generateWhatsAppLink() {
    const adminPhoneNumber = '62895384799331';
    const opsId = document.getElementById('ops-id').value;
    const namaLengkap = document.getElementById('nama').value;
    const nik = document.getElementById('nik').value;
    const namaBank = document.getElementById('nama-bank').value;
    const noRekening = document.getElementById('no-rekening').value;
    const namaPenerima = document.getElementById('nama-penerima').value;

    let bankInfo = namaBank;
    if (namaBank === 'Lainnya') {
        bankInfo = document.getElementById('bank-lainnya').value;
    }

    const message = `Halo Admin\nSaya sudah mengisi data penggajian, berikut informasinya:\n\nOpsID: ${opsId}\nNama Lengkap: ${namaLengkap}\nNIK: ${nik}\nBank: ${bankInfo}\nNo Rekening: ${noRekening}\nNama Penerima: ${namaPenerima}\n\nMohon bantuannya untuk dicek dan diproses ya.\nTerima kasih banyak!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`;

    const whatsappLink = document.getElementById('whatsapp-link');
    if (whatsappLink) {
        whatsappLink.href = whatsappUrl;
    }
}

function validatePage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) {
        console.error('Validation failed: Page element not found for id', pageId);
        return false;
    }
    const inputs = page.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    console.log(`Validating page: ${pageId}`);
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            console.log(`Validation failed for input: ${input.id || input.name}, value: '${input.value}'`);
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '#ccc';
        }
    });
    if (!isValid) {
        alert('Harap isi semua bidang yang wajib diisi.');
        console.log(`Validation result for ${pageId}: FAILED`);
    } else {
        console.log(`Validation result for ${pageId}: PASSED`);
    }
    return isValid;
}

function validateForm() {
    const currentPageId = document.querySelector('.page:not(.hidden)').id;
    return validatePage(currentPageId);
}

function populateReview() {
    const reviewContent = document.getElementById('review-content');
    const form = document.getElementById('payroll-form');
    const formData = new FormData(form);
    let html = '<h3>Harap periksa kembali data Anda:</h3>';

    for (let [key, value] of formData.entries()) {
        const label = form.querySelector(`label[for='${key.replace(/_/g, '-')}']`);
        const labelText = label ? label.innerText.replace('*', '').trim() : key;
        
        // Skip empty non-file inputs
        if (!(value instanceof File) && !value) {
            continue;
        }

        if (key.endsWith('-lainnya')) {
            continue; 
        }

        let displayValue = value instanceof File ? value.name : value;
        if (value === 'Lainnya') {
            const lainnyaInputName = key.replace(/-/g, '_') + '_lainnya'; // a bit fragile
            const realKey = key.replace(/-/g, '-');
            const lainnyaValue = formData.get(realKey + '-lainnya');
            if (lainnyaValue) {
                displayValue = lainnyaValue;
            }
        }

        html += `<p><strong>${labelText}:</strong> ${displayValue}</p>`;
    }

    reviewContent.innerHTML = html;
}

// --- NIK Duplication Check Simulation using localStorage ---

function isDuplicateNik(nik) {
    const registeredNiks = JSON.parse(localStorage.getItem('registeredNiks')) || [];
    return registeredNiks.includes(nik);
}

function saveNik(nik) {
    const registeredNiks = JSON.parse(localStorage.getItem('registeredNiks')) || [];
    registeredNiks.push(nik);
    localStorage.setItem('registeredNiks', JSON.stringify(registeredNiks));
}