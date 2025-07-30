document.addEventListener('DOMContentLoaded', function() {
    // Bank account number validation patterns
    const bankAccountPatterns = {
        'BCA': { pattern: /^\d{10}$/, message: 'Nomor rekening BCA harus 10 digit angka' },
        'Mandiri': { pattern: /^\d{13}$/, message: 'Nomor rekening Mandiri harus 13 digit angka' },
        'BRI': { pattern: /^\d{15}$/, message: 'Nomor rekening BRI harus 15 digit angka' },
        'BNI': { pattern: /^\d{10}$/, message: 'Nomor rekening BNI harus 10 digit angka' },
        'CIMB Niaga': { pattern: /^\d{10,13}$/, message: 'Nomor rekening CIMB Niaga harus 10-13 digit angka' },
        'BTN': { pattern: /^\d{16}$/, message: 'Nomor rekening BTN harus 16 digit angka' },
        'Danamon': { pattern: /^\d{10,16}$/, message: 'Nomor rekening Danamon harus 10-16 digit angka' },
        'Permata': { pattern: /^\d{9,16}$/, message: 'Nomor rekening Permata harus 9-16 digit angka' },
        'Maybank': { pattern: /^\d{10,12}$/, message: 'Nomor rekening Maybank harus 10-12 digit angka' },
        'Panin': { pattern: /^\d{10}$/, message: 'Nomor rekening Panin harus 10 digit angka' },
        'OCBC NISP': { pattern: /^\d{12}$/, message: 'Nomor rekening OCBC NISP harus 12 digit angka' },
        'UOB': { pattern: /^\d{10}$/, message: 'Nomor rekening UOB harus 10 digit angka' },
        'HSBC': { pattern: /^\d{10,12}$/, message: 'Nomor rekening HSBC harus 10-12 digit angka' },
        'Standard Chartered': { pattern: /^\d{10,16}$/, message: 'Nomor rekening Standard Chartered harus 10-16 digit angka' },
        'Bank Mega': { pattern: /^\d{10}$/, message: 'Nomor rekening Bank Mega harus 10 digit angka' },
        'Bank Syariah Indonesia': { pattern: /^\d{10}$/, message: 'Nomor rekening Bank Syariah Indonesia harus 10 digit angka' }
    };

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

    // Setup bank account validation
    const bankSelect = document.getElementById('nama-bank');
    const accountNumberInput = document.getElementById('no-rekening');
    const accountNumberError = document.getElementById('no-rekening-error');

    if (bankSelect && accountNumberInput) {
        bankSelect.addEventListener('change', function() {
            const selectedBank = this.value;
            if (selectedBank && bankAccountPatterns[selectedBank]) {
                const pattern = bankAccountPatterns[selectedBank];
                accountNumberInput.setAttribute('data-bank', selectedBank);
                accountNumberInput.setAttribute('data-pattern', pattern.pattern.source);
                accountNumberInput.setAttribute('data-message', pattern.message);
                
                // Clear previous error when bank changes
                if (accountNumberError) {
                    accountNumberError.style.display = 'none';
                    accountNumberError.textContent = '';
                }
            }
        });

        // Validate account number on input
        accountNumberInput.addEventListener('input', function() {
            const selectedBank = bankSelect.value;
            const accountNumber = this.value.trim();
            
            if (selectedBank && accountNumber && bankAccountPatterns[selectedBank]) {
                const pattern = bankAccountPatterns[selectedBank];
                const isValid = pattern.pattern.test(accountNumber);
                
                if (accountNumberError) {
                    if (!isValid && accountNumber.length > 0) {
                        accountNumberError.textContent = pattern.message;
                        accountNumberError.style.display = 'block';
                        accountNumberError.style.color = '#e74c3c';
                    } else {
                        accountNumberError.style.display = 'none';
                        accountNumberError.textContent = '';
                    }
                }
            }
        });
    }

    document.querySelectorAll('.hidden-group').forEach(group => {
        group.classList.add('hidden-group');
    });

    const form = document.getElementById('payroll-form');

    const pages = document.querySelectorAll('.page');
    let currentPageIndex = 0;
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const dummyBtn = document.getElementById('dummy-btn');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validatePage(currentPageIndex)) {
                if (currentPageIndex < 2) {
                    currentPageIndex++;
                    showPage(currentPageIndex);
                    if (currentPageIndex === 1) {
                        populateReview();
                    }
                }
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                showPage(currentPageIndex);
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';

            const formData = new FormData(form);

            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                
                if (response.ok) {
                    showPage(2); // halaman success adalah index 2
                    const nama = document.getElementById('nama').value;
                    const waLink = document.getElementById('whatsapp-link');
                    const message = `Halo, saya ${nama} sudah mengisi form penggajian. Mohon diproses. Terima kasih.`;
                    waLink.href = `https://wa.me/6285156776329?text=${encodeURIComponent(message)}`;
                } else {
                    console.error('Submission failed:', result);
                    
                    // Handle different types of errors
                    if (response.status === 409) {
                        // NIK duplicate error
                        alert('NIK yang Anda masukkan sudah terdaftar dalam sistem. Silakan periksa kembali atau hubungi admin jika ini adalah kesalahan.');
                    } else if (result.errors && Array.isArray(result.errors)) {
                        // Other validation errors
                        const errorMessage = `${result.message}:\n\n${result.errors.join('\n')}`;
                        alert(errorMessage);
                    } else {
                        alert(`Error: ${result.message || 'Terjadi kesalahan yang tidak diketahui'}`);
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Terjadi kesalahan jaringan. Periksa koneksi internet Anda dan coba lagi.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kirim';
            }
        });
    }

    if (dummyBtn) {
        dummyBtn.addEventListener('click', fillWithDummyData);
    }

    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle('current', i === index);
            page.classList.toggle('hidden', i !== index);
        });
        currentPageIndex = index;
        const isReviewPage = index === 1; // page2 adalah review
        const isSuccessPage = index === 2; // page3 adalah success

        if (prevBtn) {
            if (index > 0 && !isSuccessPage) {
                prevBtn.classList.remove('hidden');
            } else {
                prevBtn.classList.add('hidden');
            }
        }
        if (nextBtn) {
            if (index < 1 && !isSuccessPage) {
                nextBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.add('hidden');
            }
        }
        if (submitBtn) {
            if (isReviewPage) {
                submitBtn.classList.remove('hidden');
            } else {
                submitBtn.classList.add('hidden');
            }
        }
        if (dummyBtn) {
            if (index === 0) {
                dummyBtn.classList.remove('hidden');
            } else {
                dummyBtn.classList.add('hidden');
            }
        }
    }

    function validatePage(index) {
        const page = pages[index];
        const inputs = Array.from(page.querySelectorAll('input[required], select[required], textarea[required]'));
        
        for (const input of inputs) {
            if (input.offsetParent === null) continue;

            if (!input.value.trim()) {
                const label = document.querySelector(`label[for='${input.id}']`);
                const labelText = label ? label.innerText : (input.name || input.id);
                alert(`Harap isi semua kolom yang wajib diisi: ${labelText}`);
                input.focus();
                return false;
            }
            
            // Special validation for account number
            if (input.id === 'no-rekening') {
                const bankSelect = document.getElementById('nama-bank');
                const selectedBank = bankSelect ? bankSelect.value : '';
                const accountNumber = input.value.trim();
                
                if (selectedBank && accountNumber && bankAccountPatterns[selectedBank]) {
                    const pattern = bankAccountPatterns[selectedBank];
                    if (!pattern.pattern.test(accountNumber)) {
                        alert(pattern.message);
                        input.focus();
                        return false;
                    }
                }
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

    function populateReview() {
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

    showPage(0);
});

function fillWithDummyData() {
    document.getElementById('ops-id').value = 'OPS12345';
    document.getElementById('nama').value = 'Budi Santoso';
    document.getElementById('nik').value = '3171234567890001';
    document.getElementById('tanggal-lahir').value = '1990-05-15';
    document.getElementById('tanggal-lahir').dispatchEvent(new Event('change'));
    document.getElementById('tempat-lahir').value = 'Jakarta';
    document.getElementById('jenis-kelamin').value = 'Laki-laki';
    document.getElementById('agama').value = 'Islam';
    document.getElementById('status-perkawinan').value = 'Belum Menikah';
    document.getElementById('alamat-ktp').value = 'Jl. Sudirman No. 123, Jakarta';
    document.getElementById('alamat-domisili').value = 'Jl. Sudirman No. 123, Jakarta';
    document.getElementById('no-hp').value = '+6281234567890';
    document.getElementById('no-wa').value = '+6281234567890';
    document.getElementById('email').value = 'budi.santoso@example.com';
    document.getElementById('tingkat-pendidikan').value = 'S1';
    document.getElementById('jurusan').value = 'Teknik Informatika';
    document.getElementById('nama-sekolah').value = 'Universitas ABC';
    document.getElementById('nama-bank').value = 'BCA';
    document.getElementById('nama-bank').dispatchEvent(new Event('change'));
    document.getElementById('no-rekening').value = '1234567890';
    document.getElementById('nama-penerima').value = 'Budi Santoso';
    document.getElementById('rt-rw').value = '001/002';
    document.getElementById('no-rumah').value = '123';
    document.getElementById('kelurahan').value = 'Menteng';
    document.getElementById('kecamatan').value = 'Menteng';
    document.getElementById('kota').value = 'Jakarta Pusat';
    document.getElementById('kode-pos').value = '10310';
    document.getElementById('kewarganegaraan').value = 'Indonesia';
    document.getElementById('tahun-masuk').value = '2008';
    document.getElementById('tahun-lulus').value = '2012';
    document.getElementById('ipk').value = '3.50';
    document.getElementById('nama-ibu').value = 'Siti Aminah';
    document.getElementById('nama-ayah').value = 'Ahmad Santoso';
    // Pemilik rekening field doesn't exist in current form structure
    document.getElementById('nama-kontak-darurat').value = 'Siti';
    document.getElementById('hubungan-kontak-darurat').value = 'Saudara Kandung';
    document.getElementById('no-hp-darurat').value = '+6281987654321';
    document.getElementById('no-wa-darurat').value = '+6281987654321';
}

function nextPage(pageId) {
    if (validatePage(pageId)) {
        showPage(pageId);
    }
}

function prevPage(pageId) {
    showPage(pageId);
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('current');
        page.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('current');
        targetPage.classList.remove('hidden');
    }
}

function generateWhatsAppLink() {
    const nama = document.getElementById('nama').value;
    const message = `Halo, saya ${nama} sudah mengisi form penggajian. Mohon diproses. Terima kasih.`;
    return `https://wa.me/6285156776329?text=${encodeURIComponent(message)}`;
}

function validatePage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return true;
    
    const inputs = page.querySelectorAll('input[required], select[required], textarea[required]');
    
    for (const input of inputs) {
        if (input.offsetParent === null) continue;
        
        if (!input.value.trim()) {
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

function validateForm() {
    return true;
}

function populateReview() {
    const reviewContent = document.getElementById('review-content');
    if (!reviewContent) return;
    
    const form = document.getElementById('payroll-form');
    const formData = new FormData(form);
    let html = '<ul>';
    
    for (const [key, value] of formData.entries()) {
        const element = form.querySelector(`[name="${key}"]`);
        if (!element) continue;
        
        const label = document.querySelector(`label[for='${element.id}']`);
        const labelText = label ? label.innerText : key;
        
        if (element.type === 'file') {
            html += `<li><strong>${labelText}:</strong> ${value.name || 'Tidak ada file'}</li>`;
        } else {
            html += `<li><strong>${labelText}:</strong> ${value || 'Tidak diisi'}</li>`;
        }
    }
    
    html += '</ul>';
    reviewContent.innerHTML = html;
}