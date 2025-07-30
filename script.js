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

    document.querySelectorAll('.hidden-group').forEach(group => {
        group.classList.add('hidden-group');
    });

    const form = document.getElementById('payroll-form');
    const nikInput = document.getElementById('nik');

    if (nikInput) {
        nikInput.addEventListener('input', function() {
            const nik = this.value;
            if (nik.length === 16) {
                if (isDuplicateNik(nik)) {
                    alert('NIK sudah terdaftar!');
                    this.value = '';
                    return;
                }
            }
        });
    }

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
            
            const nik = document.getElementById('nik').value;
            if (isDuplicateNik(nik)) {
                alert('NIK sudah terdaftar!');
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

                if (response.ok) {
                    saveNik(nik);
                    showPage(2); // halaman success adalah index 2
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
                alert('Terjadi kesalahan saat mengirim form. Silakan coba lagi.');
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

        if (prevBtn) prevBtn.style.display = (index > 0 && !isSuccessPage) ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.style.display = (index < 1 && !isSuccessPage) ? 'inline-block' : 'none';
        if (submitBtn) submitBtn.style.display = isReviewPage ? 'inline-block' : 'none';
        if (dummyBtn) dummyBtn.style.display = (index === 0) ? 'inline-block' : 'none';
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
    document.getElementById('alamat').value = 'Jl. Sudirman No. 123, Jakarta';
    document.getElementById('no-hp').value = '+6281234567890';
    document.getElementById('no-wa').value = '+6281234567890';
    document.getElementById('email').value = 'budi.santoso@example.com';
    document.getElementById('tingkat-pendidikan').value = 'S1';
    document.getElementById('jurusan').value = 'Teknik Informatika';
    document.getElementById('nama-sekolah').value = 'Universitas ABC';
    document.getElementById('nama-bank').value = 'BCA';
    document.getElementById('nama-bank').dispatchEvent(new Event('change'));
    document.getElementById('no-rekening').value = '1234567890';
    document.getElementById('pemilik-rekening').value = 'Budi Santoso';
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

function isDuplicateNik(nik) {
    const savedNiks = JSON.parse(localStorage.getItem('submittedNiks') || '[]');
    return savedNiks.includes(nik);
}

function saveNik(nik) {
    const savedNiks = JSON.parse(localStorage.getItem('submittedNiks') || '[]');
    savedNiks.push(nik);
    localStorage.setItem('submittedNiks', JSON.stringify(savedNiks));
}