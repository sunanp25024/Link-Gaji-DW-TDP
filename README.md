# LINK PENGGAJIAN DW TDP

Aplikasi formulir penggajian untuk karyawan DW TDP dengan integrasi Google Sheets dan Google Drive.

## Fitur

- Formulir multi-halaman dengan validasi lengkap
- Upload dokumen (KTP, KK, Buku Tabungan, Foto Selfie)
- Integrasi dengan Google Sheets untuk penyimpanan data
- Integrasi dengan Google Drive untuk penyimpanan file
- Validasi NIK duplikat
- Konfirmasi WhatsApp otomatis
- Responsive design

## Teknologi

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Google Sheets
- **File Storage**: Google Drive
- **Deployment**: Vercel

## Setup Development

1. Clone repository:
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```
Kemudian edit file `.env` dengan kredensial Google Service Account Anda.

4. Jalankan aplikasi:
```bash
npm start
```

## Setup Google Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable Google Sheets API dan Google Drive API
4. Buat Service Account di IAM & Admin > Service Accounts
5. Download kredensial JSON dan salin nilai-nilainya ke file `.env`
6. Share Google Sheet dan Drive folder dengan email service account

## Deployment ke Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy

## Environment Variables

Pastikan semua environment variables berikut sudah diset di Vercel:

- `PROJECT_ID`
- `PRIVATE_KEY_ID` 
- `PRIVATE_KEY`
- `CLIENT_EMAIL`
- `CLIENT_ID`
- `CLIENT_X509_CERT_URL`

## Struktur File

```
├── index.html          # Halaman utama formulir
├── style.css           # Styling utama
├── custom.css          # Styling tambahan
├── script.js           # Logic frontend
├── server.js           # Backend server
├── package.json        # Dependencies
├── vercel.json         # Konfigurasi deployment
└── public/             # Asset statis
```

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request